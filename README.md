# DeltaDSL — VSCode / Cursor language extension

Syntax highlighting + snippets for **DeltaDSL** — the indicator
scripting language of [MRD Indicators](https://app.mrd-indicators.com).

> Use the `.dsl` or `.mrd` file extension. **Do NOT use `.pine`** —
> that extension belongs to TradingView Pine Script and using it
> would conflict with Pine Script extensions like
> `0xjcf.pine-script-syntax`.

---

## Features

- Full syntax highlighting:
  - Directives — `@version`, `@name`, `@input`, `@pane`
  - Keywords — `if / elseif / else / end / for / to / step / fn /
    return / and / or / not / true / false`
  - Built-in series — `open high low close volume hl2 hlc3 ohlc4
    time bar_index cvd open_interest funding_rate …`
  - Built-in functions — `sma rsi macd_hist atr stdev pivothigh
    htf_resample …`
  - Drawing functions — `plotLine plotHline plotBand labelNew
    lineNew drawingTrendline alertcondition logInfo …`
  - Typed input builders — `input.int input.float input.bool
    input.source input.color …`
  - String placeholders `{{symbol}}` and color literals `"#F0B90B"`
- 25+ snippets — type `header`, `@input-int`, `if`, `for`, `fn`,
  `plotLine`, `alertcondition`, `pane-osc`, `labelNew` … then Tab
  to expand
- Smart indentation for `if / for / fn` blocks
- Auto-closing brackets and quotes

---

## Installation

### Option 1: Search in Cursor / Open VSX (recommended once approved)

1. Open Cursor.
2. Press `Cmd+Shift+X` (Mac) / `Ctrl+Shift+X` (Win/Linux) to open
   Extensions panel.
3. Search for **deltadsl**.
4. Click **Install**.

> Status: pending review on [Open VSX](https://open-vsx.org). Until
> approved, use Option 2.

### Option 2: Install from VSIX file

1. Download the latest `deltadsl-X.Y.Z.vsix` from the
   [Releases page](https://github.com/PhamNhinh/vscode-deltadsl/releases).
2. Open Cursor / VSCode.
3. Press `Cmd+Shift+P` (Mac) / `Ctrl+Shift+P` (Win/Linux).
4. Type **"Install from VSIX"** → Enter.
5. Pick the downloaded `.vsix` file.
6. Reload window when prompted.

Or via terminal:

```bash
cursor --install-extension deltadsl-0.1.0.vsix
# or for VSCode:
code --install-extension deltadsl-0.1.0.vsix
```

---

## Quick test

Create a file named `test.dsl` and paste:

```
@indicator "RSI Overbought Alert"
@input length = 14
@input threshold = 70
@version 1

rsi_value = rsi(close, length)
plotLine("RSI", rsi_value)
plotHline(threshold, color="#F0B90B", style="dashed")
alertcondition(rsi_value > threshold, "RSI overbought on {{symbol}}")
```

Every keyword, builtin, and directive should be coloured according
to your theme.

---

## Supported file extensions

| Extension | Description |
|---|---|
| `.dsl` | Primary extension for DeltaDSL scripts |
| `.mrd` | Alias — equivalent to `.dsl` |

---

## Building from source

Clone this repo, install `vsce`, then package:

```bash
git clone https://github.com/PhamNhinh/vscode-deltadsl.git
cd vscode-deltadsl
npm install -g @vscode/vsce
vsce package --no-yarn --allow-missing-repository \
  --baseContentUrl https://github.com/PhamNhinh/vscode-deltadsl/raw/main \
  --baseImagesUrl https://github.com/PhamNhinh/vscode-deltadsl/raw/main
```

Output: `deltadsl-X.Y.Z.vsix`

### Dev mode (live reload)

Open this folder in VSCode/Cursor → press `F5` → an "Extension
Development Host" window launches with the extension auto-loaded.
Open `samples/example.dsl` to see highlighting live.

---

## License

See [LICENSE.txt](./LICENSE.txt). Proprietary — free to install and
use for authoring DeltaDSL scripts inside any VSCode-compatible
editor. Redistribution to other marketplaces requires written
consent from MRD Indicators.

---

## Issues & feedback

Open an issue on the [GitHub issue
tracker](https://github.com/PhamNhinh/vscode-deltadsl/issues).
