# Changelog

All notable changes to the **DeltaDSL** VSCode extension are recorded here.

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
