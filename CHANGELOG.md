# Changelog

All notable changes to the **DeltaDSL** VSCode extension are recorded here.

## [0.2.0] — 2026-05-27

### Added
- **Hover documentation** — mouse-hover any builtin function, drawing
  primitive, series, or input builder to see its signature and a
  short description.
- **Smart autocomplete** — `Ctrl+Space` (or as you type) suggests
  every builtin from the runtime catalog along with its signature and
  doc-string. User-defined variables (`name = …`) and inputs
  (`@input name = …`) appear at the top of the list.
- **Signature help** — typing `fn(` opens a parameter popup that
  highlights the active argument as you advance past commas.
- All three features are powered by a 257-entry catalog generated
  directly from the official MRD Indicators runtime, ensuring perfect
  parity with the web editor.

## [0.1.1] — 2026-05-27

### Changed
- Rewrote `README.md` as professional product documentation suitable
  for marketplace listings.
- Refined extension description and tags in `package.json`.
- Added `repository`, `bugs`, and `homepage` URLs in `package.json`.

## [0.1.0] — 2026-05-27

### Added
- Initial release.
- File extensions: `.dsl`, `.mrd`.
- TextMate grammar covering directives (`@version`, `@name`, `@input`,
  `@pane`), keywords (`if`/`elseif`/`else`/`end`/`for`/`to`/`step`/`fn`/
  `return`/`and`/`or`/`not`/`true`/`false`/`na`), built-in series
  (OHLCV + derivatives + bar/time series), and the full built-in
  function catalog (math, MA, stats, oscillators, volatility, volume,
  market structure, multi-timeframe, dynamic arrays, colour helpers,
  format/time helpers, drawing introspection, logs, drawing primitives,
  alert wiring, and typed `input.*` builders).
- Color literal recognition for `"#RRGGBB[AA]"` and `"rgb[a](…)"`
  strings.
- Placeholder highlighting (`{{symbol}}`, `{{close}}`, …) inside alert
  message strings.
- 25+ snippets for common patterns: `header`, `@input-int`,
  `@input-source`, `if`, `for`, `fn`, `plotLine`, `plotHline`,
  `alertcondition`, `pane-osc`, `labelNew`, `logInfo`, …
- Auto-closing pairs + auto-indent for `if`/`for`/`fn` → `end` blocks.
