// DeltaDSL sample — open this file with the extension installed to
// sanity-check syntax highlighting (directives, builtins, drawing fns,
// keywords, color literals, placeholders).
@version 1
@name      "RSI + Pivot Sweep"
@pane      "overlay"

@input period     = input.int(14, "RSI period", minval=2, maxval=200)
@input leftBars   = input.int(5,  "Pivot left",  minval=1)
@input rightBars  = input.int(5,  "Pivot right", minval=1)
@input src        = input.source("close", "Source")
@input upColor    = input.color("#0ECB81", "Bull color")
@input dnColor    = input.color("#F6465D", "Bear color")
@input showAlerts = input.bool(true, "Emit alerts")

// ── Math + structure ────────────────────────────────────────────────
r          = rsi(src, period)
ph         = pivothigh(high, leftBars, rightBars)
pl         = pivotlow(low,   leftBars, rightBars)
sweepHigh  = crossover(close, fixnan(ph))
sweepLow   = crossunder(close, fixnan(pl))

// Vectorised colour selection per bar
bandColor  = iff(r >= 50, upColor, dnColor)

// Block-level branch — script-eval time only
if showAlerts and bar_index > leftBars + rightBars
  alertcondition(sweepHigh,
                 title   = "Pivot sweep high",
                 message = "{{symbol}} swept pivot high at {{close}}",
                 frequency = "once_per_close")
  alertcondition(sweepLow,
                 title   = "Pivot sweep low",
                 message = "{{symbol}} swept pivot low at {{close}}",
                 frequency = "once_per_close")
end

// User-defined helper (inline form)
fn band(price, width) = price * (1 + width / 100.0)

upper = band(close, 1.0)
lower = band(close, -1.0)

// ── Drawing ─────────────────────────────────────────────────────────
plotLine(close, color="#FFFFFF", width=1.5)
plotLine(upper, color=upColor,  width=1)
plotLine(lower, color=dnColor,  width=1)
plotBand(upper, lower, color="rgba(240,185,11,0.06)")

plotMarkerUp(sweepHigh,   high, color=upColor, size=8)
plotMarkerDown(sweepLow,  low,  color=dnColor, size=8)

// Per-event persistent label on the most recent sweep
if sweepHigh and barstate_islast
  labelNew("last-sweep",
           last_bar_time, at(high, last_bar_index),
           "Sweep " + tostring(at(close, last_bar_index), "0.00"),
           color="#FFFFFF", bg="rgba(0,0,0,0.65)", border=upColor,
           size=11, anchor="above")
end

// Diagnostic snapshot — fires once at the end of the run
logInfo("RSI {0} · Sweeps high={1} low={2}",
        at(r, last_bar_index),
        runStreak(sweepHigh),
        runStreak(sweepLow))
