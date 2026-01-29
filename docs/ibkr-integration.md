# IBKR Integration Plan — Mission Control

## Overview

Add Interactive Brokers (IBKR) as a second broker to Mission Control alongside
TastyTrade. The dashboard should support viewing portfolios from both brokers,
switching between them, and eventually routing trades to either.

## Current State

- **TastyTrade**: Live account (5WI30688), $400 balance, integrated into trade pipeline
- **IBKR**: Account pending approval (IBKR Pro, margin, Level 3 options)
- **Bot**: `/Users/henry/Projects/tastytrade-bot/` has `broker.py` abstraction layer ready

## Phase 1: Backend API (after IBKR approval)

### New Endpoints

```
GET  /api/brokers                    → List configured brokers + status
GET  /api/brokers/:name/balances     → Account balances for a broker
GET  /api/brokers/:name/positions    → Open positions for a broker
GET  /api/brokers/:name/orders       → Order history for a broker
POST /api/brokers/:name/connect      → Trigger broker connection
POST /api/brokers/active             → Set the active broker { broker: "ibkr" }
```

### Implementation

The backend (`server.js` / Express) will shell out to the Python broker abstraction:

```javascript
// Example: GET /api/brokers/ibkr/balances
app.get('/api/brokers/:name/balances', async (req, res) => {
  const { name } = req.params;
  const result = await exec(`python3.11 broker.py ${name} balances`);
  res.json(JSON.parse(result.stdout));
});
```

Or better: add a lightweight Flask/FastAPI sidecar in the tastytrade-bot project
that exposes broker data over HTTP, and Mission Control's Express backend proxies to it.

### Database Changes

```sql
-- New table for multi-broker support
CREATE TABLE broker_accounts (
  id INTEGER PRIMARY KEY,
  broker TEXT NOT NULL,         -- 'tastytrade' or 'ibkr'
  account_id TEXT NOT NULL,
  label TEXT,                    -- e.g. "Zach's IBKR Margin"
  is_active BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add broker column to trades table
ALTER TABLE trades ADD COLUMN broker TEXT DEFAULT 'tastytrade';
```

## Phase 2: Frontend Dashboard

### Broker Selector

Add a dropdown/toggle in the dashboard header:

```
┌─────────────────────────────────────────────┐
│  Mission Control    [TastyTrade ▾] [ibkr]   │
│                                              │
│  Portfolio Value: $400.00                    │
│  Buying Power:    $xxx.xx                    │
└─────────────────────────────────────────────┘
```

- Click to switch active broker view
- Show connection status indicator (🟢 connected / 🔴 disconnected)
- Combined view option: merge positions from both brokers

### Portfolio View Updates

```
┌──────────────────────────────────────────────┐
│  Positions                    [All Brokers ▾]│
│                                               │
│  TastyTrade (5WI30688)                       │
│  ├─ IREN   2 shares @ $X.XX      +$X.XX     │
│  └─ (cash: $XXX.XX)                         │
│                                               │
│  IBKR (UXXXXXXX)                             │
│  ├─ AAPL  10 shares @ $XXX.XX    +$XX.XX    │
│  ├─ SPY   250P 03/21  1 contract             │
│  └─ (cash: $X,XXX.XX)                       │
└──────────────────────────────────────────────┘
```

### Trade History

- Add broker column/filter to trade journal view
- Color-code by broker (e.g., blue = TastyTrade, orange = IBKR)
- Filter: "Show TastyTrade only" / "Show IBKR only" / "Show all"

## Phase 3: Trade Routing

Once both brokers are live, the Telegram approval buttons should include
broker selection:

```
📊 LONG AAPL @ $150.00
Stop: $145.00 | Target: $160.00
Shares: 5 | Risk: $25.00 (2.5%)

[Execute TastyTrade] [Execute IBKR]
[Skip] [Dry Run]
```

### Smart Routing (future)

- Route based on which broker has more buying power
- Route options to IBKR (better fills, more complex strategies)
- Route stocks to TastyTrade (simpler, lower commissions on small accounts)

## Phase 4: Combined Analytics

### Dashboard Cards

- **Total Portfolio**: Sum across both brokers
- **Total P&L**: Combined daily/weekly/monthly
- **Allocation**: Pie chart by broker + by ticker
- **Risk Exposure**: Combined position risk across brokers

### API for Combined Data

```
GET /api/portfolio/combined        → Merged positions + balances
GET /api/portfolio/combined/pnl    → Combined P&L
GET /api/portfolio/allocation      → Allocation breakdown
```

## Technical Requirements

- **ib_async** Python library (pip install ib_async)
- **TWS or IB Gateway** running on Zach's machine (or Mac mini via Tailscale)
- **TWS API enabled** with socket port configured
- Consider running IB Gateway as a persistent service (auto-restart on crash)

## Environment Setup

```bash
# On the Mac mini (or wherever the bot runs)
~/.config/ibkr/live.env:
  IBKR_ACCOUNT=U1234567
  IBKR_HOST=127.0.0.1
  IBKR_PORT=7496

# In the bot's environment
export BROKER=ibkr  # or tastytrade
```

## Timeline

1. **Now**: ✅ Scaffolding complete (ibkr_client.py, ibkr_config.py, broker.py)
2. **After IBKR approval**: Fill in credentials, test connection, run paper trades
3. **Week 1**: Backend API endpoints for broker data
4. **Week 2**: Frontend broker selector + portfolio view
5. **Week 3**: Trade routing through Telegram buttons
6. **Week 4**: Combined analytics + smart routing
