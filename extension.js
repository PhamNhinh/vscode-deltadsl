/**
 * DeltaDSL Language Support — extension entry point.
 *
 * Registers three VSCode language providers powered by the static
 * `builtins.json` catalog (generated from the runtime completions
 * source — see scripts/build-builtins.mjs).
 *
 *   - HoverProvider           → mouse-hover doc popup
 *   - CompletionItemProvider  → Ctrl+Space autocomplete with descriptions
 *   - SignatureHelpProvider   → arg signature popup while typing fn(...)
 */
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

const LANGUAGE_ID = 'deltadsl';

// Word pattern that allows `input.int`, `input.float`, etc.
const WORD_PATTERN = /[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)?/;

let CATALOG = [];
let BY_LABEL = new Map();

function loadCatalog(context) {
  const file = path.join(context.extensionPath, 'builtins.json');
  try {
    const raw = fs.readFileSync(file, 'utf8');
    CATALOG = JSON.parse(raw);
    BY_LABEL = new Map(CATALOG.map((entry) => [entry.label, entry]));
  } catch (e) {
    vscode.window.showWarningMessage(
      'DeltaDSL: failed to load builtins.json — hover and autocomplete disabled.',
    );
    CATALOG = [];
    BY_LABEL = new Map();
  }
}

function kindToCompletionItemKind(kind) {
  const K = vscode.CompletionItemKind;
  switch (kind) {
    case 'fn':        return K.Function;
    case 'draw':      return K.Method;
    case 'series':    return K.Variable;
    case 'keyword':   return K.Keyword;
    case 'directive': return K.Constant;
    case 'input':     return K.Field;
    case 'var':       return K.Variable;
    default:          return K.Text;
  }
}

function kindLabel(kind) {
  switch (kind) {
    case 'fn':        return 'function';
    case 'draw':      return 'drawing';
    case 'series':    return 'series';
    case 'keyword':   return 'keyword';
    case 'directive': return 'directive';
    case 'input':     return 'input';
    case 'var':       return 'variable';
    default:          return kind || '';
  }
}

function buildMarkdown(entry) {
  const md = new vscode.MarkdownString('', true);
  md.isTrusted = false;
  md.appendCodeblock(entry.signature || entry.label, LANGUAGE_ID);
  if (entry.kind) {
    md.appendMarkdown(`\n_${kindLabel(entry.kind)}_\n\n`);
  }
  if (entry.doc) {
    md.appendMarkdown(entry.doc);
  }
  return md;
}

// ── Scope extraction ─────────────────────────────────────────────────
// Mirrors `extractScopeCompletions` from the runtime — pulls user-declared
// `name = …` and `@input name = …` so they appear in autocomplete.
const ASSIGN_RE = /^[ \t]*([A-Za-z_][A-Za-z0-9_]*)[ \t]*=[ \t]*(.*)$/;
const INPUT_RE  = /^[ \t]*@input[ \t]+([A-Za-z_][A-Za-z0-9_]*)[ \t]*=[ \t]*(.*?)(?:[ \t]*,.*)?$/;

function extractScope(source) {
  const out = [];
  const seen = new Set();
  for (const rawLine of String(source || '').split('\n')) {
    const line = rawLine.replace(/\/\/.*$/, '');
    let m;
    if ((m = INPUT_RE.exec(line))) {
      const name = m[1];
      if (!seen.has(name)) {
        seen.add(name);
        out.push({
          label: name,
          kind: 'input',
          signature: `@input ${name} = ${m[2].trim() || '?'}`,
          doc: 'User input (declared via @input)',
        });
      }
      continue;
    }
    if ((m = ASSIGN_RE.exec(line))) {
      const name = m[1];
      if (!seen.has(name) && !BY_LABEL.has(name)) {
        seen.add(name);
        out.push({
          label: name,
          kind: 'var',
          signature: `${name} = ${(m[2] || '').trim() || '?'}`,
          doc: 'Variable defined in this script',
        });
      }
    }
  }
  return out;
}

// ── Providers ────────────────────────────────────────────────────────

const hoverProvider = {
  provideHover(document, position) {
    const range = document.getWordRangeAtPosition(position, WORD_PATTERN);
    if (!range) return null;
    const word = document.getText(range);
    const entry = BY_LABEL.get(word) ||
                  extractScope(document.getText()).find((e) => e.label === word);
    if (!entry) return null;
    return new vscode.Hover(buildMarkdown(entry), range);
  },
};

const completionProvider = {
  provideCompletionItems(document, position) {
    const scope = extractScope(document.getText());
    const items = [...scope, ...CATALOG]
      .filter((entry) => entry.kind !== 'directive')
      .map((entry) => {
        const item = new vscode.CompletionItem(
          entry.label,
          kindToCompletionItemKind(entry.kind),
        );
        item.detail = entry.signature || '';
        item.documentation = buildMarkdown(entry);
        if (entry.kind === 'fn' || entry.kind === 'draw') {
          item.insertText = new vscode.SnippetString(`${entry.label}($0)`);
        }
        return item;
      });

    // Directives only when user typed `@`
    const linePrefix = document.lineAt(position).text.slice(0, position.character);
    if (/@\w*$/.test(linePrefix)) {
      for (const entry of CATALOG.filter((e) => e.kind === 'directive')) {
        const item = new vscode.CompletionItem(
          entry.label,
          vscode.CompletionItemKind.Constant,
        );
        item.detail = entry.signature || '';
        item.documentation = buildMarkdown(entry);
        items.push(item);
      }
    }

    return items;
  },
};

// ── Signature help ───────────────────────────────────────────────────
// Walks back from the cursor through balanced parens to find the
// enclosing fn call. Commas at depth 0 advance `activeParameter`.

function locateSignature(document, position) {
  const text = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
  let depth = 0;
  let activeParameter = 0;
  for (let i = text.length - 1; i >= 0; i--) {
    const ch = text[i];
    if (ch === ')') depth++;
    else if (ch === '(') {
      if (depth === 0) {
        // Walk back to capture fn name (allow dotted: input.int)
        let j = i - 1;
        while (j >= 0 && /\s/.test(text[j])) j--;
        const end = j + 1;
        while (j >= 0 && /[A-Za-z0-9_.]/.test(text[j])) j--;
        const name = text.slice(j + 1, end);
        if (!name) return null;
        const entry = BY_LABEL.get(name);
        if (!entry || (entry.kind !== 'fn' && entry.kind !== 'draw')) return null;
        return { entry, activeParameter };
      }
      depth--;
    } else if (ch === ',' && depth === 0) {
      activeParameter++;
    }
  }
  return null;
}

const signatureProvider = {
  provideSignatureHelp(document, position) {
    const found = locateSignature(document, position);
    if (!found) return null;
    const { entry, activeParameter } = found;

    const sig = new vscode.SignatureInformation(
      entry.signature || entry.label,
      buildMarkdown(entry),
    );

    // Parse parameters from signature string: `name(a, b, c=default)` → ['a','b','c=default']
    const match = /\(([^)]*)\)/.exec(entry.signature || '');
    if (match) {
      const params = match[1]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      sig.parameters = params.map((p) => new vscode.ParameterInformation(p));
    }

    const help = new vscode.SignatureHelp();
    help.signatures = [sig];
    help.activeSignature = 0;
    help.activeParameter = Math.min(activeParameter, (sig.parameters?.length || 1) - 1);
    return help;
  },
};

// ── Activation ───────────────────────────────────────────────────────

function activate(context) {
  loadCatalog(context);

  context.subscriptions.push(
    vscode.languages.registerHoverProvider(LANGUAGE_ID, hoverProvider),
    vscode.languages.registerCompletionItemProvider(
      LANGUAGE_ID,
      completionProvider,
      '@', '.',
    ),
    vscode.languages.registerSignatureHelpProvider(
      LANGUAGE_ID,
      signatureProvider,
      '(', ',',
    ),
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
