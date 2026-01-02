Chronological User Workflows in CTRM Simulator UI
1️⃣ Initial Setup & Login
Login at /auth with credentials
System stores user info and token in localStorage
Redirects to approval dashboard
2️⃣ Front Office - Trade Booking (Trader Role)
Navigate to Book Trade (/fo/trade-booking)

Select portfolio, counterparty, commodity
Enter quantity, price, trade date
Click "Submit Trade"
Trade goes to "PENDING_APPROVAL" status
Navigate to Search Trades (/trades/search)

Filter by portfolio, counterparty, commodity, status
View all your submitted trades
Click on a trade to see its history
Click on any trade → Trade History (/trade/:tradeId/history)

See timeline of all versions (v1, v2, v3...)
View change diffs (what changed from version to version)
See who amended/cancelled and when
3️⃣ Risk Management - Approval Workflow (Risk Manager Role)
Navigate to Approval Queue (/risk/approvals)

See all pending approvals
Filter by status, role, portfolio, MTM threshold
View summary cards (pending/approved/rejected counts)
Quick approve/reject from table
Click on an approval → Approval Detail (/risk/approval/:id)

Review full trade details
Check approval rules applied
Add comments
Approve or Reject (with mandatory reason)
View decision history for completed approvals
4️⃣ Risk Management - Position Monitoring
Navigate to Positions (/risk/positions)
Select date
Choose portfolio (or leave empty for all)
Click "Calculate Positions"
View aggregated positions by portfolio/commodity
See Long/Short/Net breakdown in summary cards
Drill down into individual positions
5️⃣ Risk Management - Limits & Breaches
Navigate to Risk Limits (/risk/limits)

View existing limits with utilization bars
Traffic lights: 🟢 OK, 🟡 WARNING, 🔴 BREACH
Click "New Limit"
Set limit type (POSITION/CREDIT/VaR/COUNTERPARTY)
Define scope, entity, max value, warning threshold
Choose breach action (ALERT/BLOCK/APPROVE_REQUIRED)
Click on breach link to see active breaches
Navigate to Breaches (/risk/breaches)

See all active limit breaches
Auto-refreshes every 30 seconds
Filter by severity (CRITICAL/WARNING)
Click "Resolve" on any breach
Add resolution notes (mandatory)
System marks breach as resolved
6️⃣ Risk Management - VaR Analysis
Navigate to VaR (/risk/var)
Enter portfolio name
Select confidence level (90%, 95%, 99%)
Choose horizon (1, 5, 10 days)
Pick calculation method (HISTORICAL/PARAMETRIC/MONTE_CARLO)
Click "Calculate VaR"
View portfolio VaR, CVaR, and VaR ladder
7️⃣ Operations - Trade Lifecycle
Navigate to Trade Status (/mo/trade-status)

Monitor trade lifecycle states
View trade progression
Navigate to Lifecycle (/mo/lifecycle)

Track lifecycle events
Monitor corporate actions
8️⃣ Operations - Valuation & P&L
Navigate to Batch Valuation (/mo/batch-valuation)

Select valuation date
Optional: Filter by portfolio
Click "Start Valuation"
Monitor run status (RUNNING/COMPLETED/FAILED)
View total trades, success/failure counts, duration
Auto-refreshes every 10 seconds
View history of past valuation runs
Navigate to P&L (/mo/pnl)

Select date
Click "Calculate P&L"
View summary cards: Total P&L, Realized, Unrealized, Top Winner
See breakdown by portfolio/commodity
Identify biggest winners/losers
Navigate to P&L Attribution (/mo/pnl-attribution)

Select date
Click "Calculate Attribution"
View waterfall chart showing:
Spot movement
Curve movement
Vol movement
Time decay
Carry
FX impact
Unexplained P&L
Drill into each attribution source
9️⃣ Operations - Scenario Analysis
Navigate to Scenarios (/mo/scenarios)

Option A - Use Preset Scenarios:

Select from presets:
Oil Crash (-20%)
Oil Spike (+30%)
Gas Rally (+50%)
Curve Steepening
Vol Spike (+50%)
Click "Run"
Option B - Build Custom Scenario:

Enter scenario name

Select scenario type (SPOT_SHOCK/CURVE_SHIFT/VOL_SHOCK/FX_SHOCK/CREDIT_SHOCK)

Choose portfolio and commodity

Set magnitude (e.g., +10%, -5%)

Pick shock date

Click "Run Scenario"

View results:

Total P&L impact
Number of trades affected
Biggest winner/loser
Trade-level impact breakdown
🔟 Configuration Management (Admin Role)
Navigate to Configuration Dashboard (/config)

Access all configuration areas
Navigate to Counterparties (/config/counterparties)

Add/edit/delete counterparties
Manage credit limits
Navigate to Instruments (/config/instruments)

Define commodities, products, contracts
Set up pricing sources
Navigate to Portfolios (/config/portfolios)

Create portfolio hierarchy
Assign traders, risk managers
1️⃣1️⃣ Logout
Click "Logout" button at bottom of navigation
Clears localStorage
Returns to login page
Recommended Test Flow (Full Cycle)
Login → 2. Book Trade → 3. Search for your trade → 4. Go to Approval Queue → 5. Approve the trade → 6. Calculate Positions (see your trade in positions) → 7. Create Risk Limit → 8. Check if any breaches → 9. Calculate VaR → 10. Run Batch Valuation → 11. View P&L → 12. Check P&L Attribution → 13. Run "Oil Crash" scenario → 14. Search trade history → 15. Logout