# BinaryDemo Pro (demo account, real market data)
Static ES-module app (no build). Run: `npx serve .` or `python3 -m http.server`, open in browser, tap ⚙ API and paste Twelve Data + Finnhub keys (stored in localStorage only).
- `src/data.js` Twelve Data history (1500 candles) + Finnhub live WebSocket + 12s price-poll fallback + key test
- `src/chart.js` HTML5 canvas candles
- `src/brain.js` signal engine (EMA, RSI, MACD, Bollinger, candle patterns, volatility filter, max 8/hr, 150s cooldown, self-tuning strictness)
- `src/app.js` demo trading, settlement, signal timing (alert 3s before next candle)
Google AI Studio / GitHub: upload folder as-is. Signals are probabilistic; payout 85% needs >54% win rate to break even.
