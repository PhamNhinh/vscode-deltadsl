# DeltaDSL Language Support

Official VSCode and Cursor extension for **DeltaDSL** — the indicator
scripting language of [MRD Indicators](https://app.mrd-indicators.com).
Write technical indicators, alerts, and chart overlays with first-class
editor support.

## Features

### IntelliSense

- **Hover documentation** — hover any builtin function, drawing
  primitive, series, or input builder to see its signature and a
  short description.
- **Autocomplete** — `Ctrl+Space` suggests every builtin from the
  runtime catalog along with its signature and doc-string. User
  variables and `@input` declarations appear at the top of the list.
- **Signature help** — typing `fn(` opens a parameter popup that
  highlights the active argument as you advance past commas.

### Syntax highlighting

Full TextMate grammar covering every construct of the language:

- **Directives** — `@version`, `@indicator`, `@name`, `@pane`, `@input`
- **Control flow** — `if`, `elseif`, `else`, `end`, `for`, `to`, `step`
- **Functions** — `fn`, `return`, with both inline and block forms
- **Logical operators** — `and`, `or`, `not`, `true`, `false`, `na`
- **Market data series** — `open`, `high`, `low`, `close`, `volume`,
  `hl2`, `hlc3`, `ohlc4`, `time`, `bar_index`, `cvd`, `open_interest`,
  `funding_rate`
- **Technical analysis library** — `sma`, `ema`, `wma`, `rsi`, `macd`,
  `atr`, `stdev`, `bb`, `stoch`, `pivothigh`, `pivotlow`, `crossover`,
  `crossunder`, and dozens more
- **Drawing primitives** — `plotLine`, `plotHline`, `plotBand`,
  `plotMarkerUp`, `plotMarkerDown`, `labelNew`, `lineNew`,
  `drawingTrendline`, `bgcolor`
- **Alert wiring** — `alertcondition`, `alert`
- **Typed input builders** — `input.int`, `input.float`, `input.bool`,
  `input.source`, `input.color`, `input.string`, `input.symbol`,
  `input.timeframe`, `input.session`
- **String placeholders** — `{{symbol}}`, `{{close}}`, `{{high}}`,
  `{{low}}`, `{{time}}` inside alert messages
- **Color literals** — inline `"#F0B90B"` and `"rgba(…)"` strings

### Productivity snippets

Over 25 ready-to-use snippets. Type the prefix, press `Tab`:

| Prefix | Expands to |
|---|---|
| `header` | Full indicator header with `@version` / `@name` / `@pane` |
| `@input-int` / `@input-float` / `@input-bool` / `@input-source` / `@input-color` | Typed input declaration |
| `if` / `for` / `fn` | Block with matching `end` |
| `plotLine` / `plotHline` / `plotBand` | Drawing call with named args |
| `alertcondition` | Alert with title + message placeholders |
| `pane-osc` | Oscillator pane scaffold |
| `labelNew` | Persistent label drawing |
| `logInfo` | Diagnostic log statement |

### Editor behavior

- Smart indentation for `if` / `for` / `fn` blocks
- Auto-closing brackets and quotes
- Comment toggle (`Cmd+/` or `Ctrl+/`)
- Bracket matching and surround pairs

## Installation

### From the marketplace

1. Open the Extensions panel — `Cmd+Shift+X` (Mac) or `Ctrl+Shift+X`
   (Windows / Linux).
2. Search for **DeltaDSL**.
3. Click **Install**.

### From a VSIX file

Download the latest `.vsix` from the
[Releases page](https://github.com/PhamNhinh/vscode-deltadsl/releases),
then either:

- Open the command palette (`Cmd+Shift+P` / `Ctrl+Shift+P`), run
  **"Extensions: Install from VSIX…"**, and select the downloaded file, or
- Run the CLI:

  ```bash
  cursor --install-extension deltadsl-0.1.1.vsix
  # or for VSCode:
  code --install-extension deltadsl-0.1.1.vsix
  ```

Reload the window when prompted.

## Getting started

Create a new file with the `.dsl` extension and paste the following:

```
@indicator "RSI Threshold"
@version  1
@pane     "below"

@input length    = input.int(14,  "RSI period", minval=2, maxval=200)
@input upper     = input.float(70, "Overbought threshold")
@input lower     = input.float(30, "Oversold threshold")
@input bullColor = input.color("#0ECB81", "Bull color")
@input bearColor = input.color("#F6465D", "Bear color")

value     = rsi(close, length)
bandColor = iff(value >= 50, bullColor, bearColor)

plotLine(value, color=bandColor, width=1.5)
plotHline(upper, color=bearColor, style="dashed")
plotHline(lower, color=bullColor, style="dashed")

alertcondition(crossover(value,  upper), "RSI overbought on {{symbol}}")
alertcondition(crossunder(value, lower), "RSI oversold on {{symbol}}")
```

Every keyword, function, and literal will be coloured according to
your editor theme.

## Supported file extensions

| Extension | Notes |
|---|---|
| `.dsl` | Primary file extension |
| `.mrd` | Alias for `.dsl` |

## Requirements

- VSCode 1.70.0 or newer, **or** any compatible editor (Cursor,
  VSCodium, code-server).
- No language server, runtime, or toolchain required — syntax
  highlighting and snippets work out of the box.

## Roadmap

Planned for upcoming releases:

- Inline diagnostics for unknown identifiers
- Go to definition for user-declared symbols
- File icon contribution to popular icon themes

## Building from source

```bash
git clone https://github.com/PhamNhinh/vscode-deltadsl.git
cd vscode-deltadsl
npm install -g @vscode/vsce
vsce package
```

The resulting `.vsix` file can be installed locally as described
above.

## License

See [LICENSE.txt](./LICENSE.txt). Free to install and use for
authoring DeltaDSL scripts. Redistribution requires written consent
from MRD Indicators.

## Feedback and support

- **Issues:** https://github.com/PhamNhinh/vscode-deltadsl/issues
- **Product:** https://app.mrd-indicators.com
