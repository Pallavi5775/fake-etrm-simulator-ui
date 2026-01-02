# CTRM Simulator UI - Component Documentation

## 📋 Overview

This document provides a comprehensive guide to all UI components built for the CTRM (Commodity Trading and Risk Management) Simulator. The system provides full coverage of trading operations, risk management, and operations workflows.

## 🎯 Components Built (100% Complete)

### Shared Components (4)
Located in: `src/components/shared/`

1. **DataTable.jsx** - Reusable table with sorting, filtering, and pagination
2. **LoadingSpinner.jsx** - Loading indicator component
3. **Toast.jsx** - Notification toast component
4. **ConfirmDialog.jsx** - Confirmation dialog for critical actions

### Phase 1: Essential Trading Operations (5 components)

#### Approval Workflow
- **[ApprovalDashboard.jsx](src/pages/risk/ApprovalDashboard.jsx)** - Enhanced approval queue with filters and summary cards
  - Real-time approval list with status tracking
  - Quick approve/reject actions
  - Filtering by status, role, portfolio, MTM range
  - Summary metrics (pending, approved, rejected counts)
  
- **[ApprovalDetail.jsx](src/pages/risk/ApprovalDetail.jsx)** - Detailed approval decision view
  - Complete trade details with valuation breakdown
  - Approval rule information
  - Decision actions (approve/reject with comments)
  - Approval history and audit trail

#### Trade Management
- **[TradeSearch.jsx](src/components/TradeSearch.jsx)** - Advanced trade search
  - Multi-criteria search (ID, portfolio, counterparty, commodity, status, dates, MTM range)
  - View, amend, and history actions
  - Results table with sorting and pagination
  
- **[TradeHistory.jsx](src/components/TradeHistory.jsx)** - Trade version timeline
  - Visual timeline of all trade versions
  - Diff viewer showing what changed
  - Amendment reasons and timestamps
  - Version navigation

- **[ApprovalRulesConfig.jsx](src/components/ApprovalRulesConfig.jsx)** ✅ Already exists
  - Book trades from templates
  - Advanced valuation configuration
  - Real-time MTM calculation

### Phase 2: Risk Management (4 components)

#### Position & Limits
- **[PositionDashboard.jsx](src/pages/risk/PositionDashboard.jsx)** - Portfolio position view
  - Real-time position aggregates by portfolio/commodity/delivery period
  - Long/Short/Net position breakdown
  - Calculate positions button for EOD runs
  - Summary cards with totals
  - Drill-down to underlying trades

- **[LimitDashboard.jsx](src/pages/risk/LimitDashboard.jsx)** - Risk limits monitoring
  - Traffic light indicators (green/yellow/red)
  - Utilization gauges with percentage tracking
  - Create new limits dialog
  - Warning threshold configuration
  - Breach action settings (BLOCK/ALERT/NOTIFY)

- **[BreachAlert.jsx](src/pages/risk/BreachAlert.jsx)** - Active breach management
  - Critical and warning breach separation
  - Auto-refresh every 30 seconds
  - Resolution workflow with notes
  - Breach details (amount, percentage, severity)
  - Time since breach detection

- **[VarDashboard.jsx](src/pages/risk/VarDashboard.jsx)** - VaR calculation
  - Portfolio VaR calculation
  - Confidence level selection (90%, 95%, 99%)
  - Horizon selection (1, 5, 10 days)
  - VaR ladder view
  - CVaR (Expected Shortfall) calculation

### Phase 3: Operations & Analytics (4 components)

#### Valuation & P&L
- **[BatchValuation.jsx](src/pages/mo/BatchValuation.jsx)** - EOD valuation management
  - Trigger batch valuation runs
  - Monitor run status (RUNNING, COMPLETED, FAILED)
  - Success/failure counts per run
  - Duration metrics
  - Auto-refresh every 10 seconds
  - Filter by portfolio

- **[PnlDashboard.jsx](src/pages/mo/PnlDashboard.jsx)** - Daily P&L view
  - Total P&L by date
  - Realized vs. Unrealized breakdown
  - P&L by portfolio and commodity
  - Top winner/loser identification
  - Calculate P&L button

- **[PnlAttribution.jsx](src/pages/mo/PnlAttribution.jsx)** - P&L waterfall analysis
  - Breakdown by source:
    - Spot movement
    - Curve movement
    - Vol movement
    - Time decay (theta)
    - Carry
    - FX impact
  - Unexplained P&L tracking
  - Waterfall chart visualization

#### Scenario Analysis
- **[ScenarioBuilder.jsx](src/pages/mo/ScenarioBuilder.jsx)** - What-if scenario tool
  - Pre-built scenarios (Oil Crash, Gas Rally, Vol Spike, etc.)
  - Custom scenario builder
  - Scenario types: Spot Shock, Curve Shift, Vol Shock, FX Shock, Credit Shock
  - Portfolio impact analysis
  - Trade-level impact breakdown
  - Biggest winner/loser identification

## 📁 File Structure

```
src/
├── components/
│   ├── shared/
│   │   ├── DataTable.jsx ✅
│   │   ├── LoadingSpinner.jsx ✅
│   │   ├── Toast.jsx ✅
│   │   └── ConfirmDialog.jsx ✅
│   ├── ApprovalRulesConfig.jsx ✅ (existing)
│   ├── TradeSearch.jsx ✅
│   └── TradeHistory.jsx ✅
├── pages/
│   ├── risk/
│   │   ├── ApprovalDashboard.jsx ✅ (enhanced)
│   │   ├── ApprovalDetail.jsx ✅
│   │   ├── PositionDashboard.jsx ✅
│   │   ├── LimitDashboard.jsx ✅
│   │   ├── BreachAlert.jsx ✅
│   │   └── VarDashboard.jsx ✅
│   └── mo/
│       ├── BatchValuation.jsx ✅
│       ├── PnlDashboard.jsx ✅
│       ├── PnlAttribution.jsx ✅
│       └── ScenarioBuilder.jsx ✅
```

## 🔧 Installation & Setup

### Prerequisites
```bash
npm install recharts  # For P&L Attribution charts
```

### React Router Configuration
Add these routes to your `App.js`:

```javascript
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Risk Management
import ApprovalDashboard from "./pages/risk/ApprovalDashboard";
import ApprovalDetail from "./pages/risk/ApprovalDetail";
import PositionDashboard from "./pages/risk/PositionDashboard";
import LimitDashboard from "./pages/risk/LimitDashboard";
import BreachAlert from "./pages/risk/BreachAlert";
import VarDashboard from "./pages/risk/VarDashboard";

// Operations
import BatchValuation from "./pages/mo/BatchValuation";
import PnlDashboard from "./pages/mo/PnlDashboard";
import PnlAttribution from "./pages/mo/PnlAttribution";
import ScenarioBuilder from "./pages/mo/ScenarioBuilder";

// Trade Management
import TradeSearch from "./components/TradeSearch";
import TradeHistory from "./components/TradeHistory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Risk Routes */}
        <Route path="/risk/approvals" element={<ApprovalDashboard />} />
        <Route path="/risk/approval/:approvalId" element={<ApprovalDetail />} />
        <Route path="/risk/positions" element={<PositionDashboard />} />
        <Route path="/risk/limits" element={<LimitDashboard />} />
        <Route path="/risk/breaches" element={<BreachAlert />} />
        <Route path="/risk/var" element={<VarDashboard />} />
        
        {/* Operations Routes */}
        <Route path="/mo/batch-valuation" element={<BatchValuation />} />
        <Route path="/mo/pnl" element={<PnlDashboard />} />
        <Route path="/mo/pnl-attribution" element={<PnlAttribution />} />
        <Route path="/mo/scenarios" element={<ScenarioBuilder />} />
        
        {/* Trade Routes */}
        <Route path="/trades/search" element={<TradeSearch />} />
        <Route path="/trade/:tradeId/history" element={<TradeHistory />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## 🎨 Design Patterns Used

### State Management
- **Local State**: `useState` for component-specific state
- **Side Effects**: `useEffect` for data fetching
- **Navigation**: `useNavigate` and `useParams` from React Router

### API Integration
- Base URL: `http://localhost:8080/api`
- Authentication: Headers with `X-User-Name`, `X-User-Role`, `Authorization`
- Error handling with user-friendly messages

### UI Patterns
- **Loading States**: LoadingSpinner component
- **Error Handling**: Toast notifications
- **Confirmation Dialogs**: For destructive actions
- **Progressive Disclosure**: Accordions for complex forms
- **Data Tables**: Sortable, filterable, paginated tables

## 🚀 Key Features

### Real-time Updates
- **BreachAlert**: Auto-refresh every 30 seconds
- **BatchValuation**: Auto-refresh every 10 seconds
- **Position Dashboard**: Manual refresh with button

### Responsive Design
- All components use Material-UI Grid system
- Mobile-friendly layouts
- Adaptive column spans (xs/sm/md)

### User Experience
- **Quick Actions**: Approve/reject from dashboard
- **Drill-down**: Click rows for details
- **Filters**: Multi-criteria filtering
- **Summary Cards**: Key metrics at a glance
- **Visual Indicators**: Color-coded status chips

## 📊 Backend API Endpoints Used

### Approval APIs
- `GET /api/approval/pending` - List pending approvals
- `GET /api/approval/{id}` - Approval details
- `POST /api/approval/{id}/approve` - Approve trade
- `POST /api/approval/{id}/reject` - Reject trade

### Position APIs
- `GET /api/risk/positions/{date}` - All positions for date
- `GET /api/risk/positions/{date}/portfolio/{portfolio}` - Portfolio positions
- `POST /api/risk/positions/calculate` - Calculate positions

### Limit & Breach APIs
- `GET /api/risk/limits` - All limits
- `POST /api/risk/limits` - Create limit
- `GET /api/risk/breaches/active` - Active breaches
- `POST /api/risk/breaches/{id}/resolve` - Resolve breach

### VaR APIs
- `POST /api/risk/var/calculate` - Calculate VaR
- `GET /api/risk/var/trade/{tradeId}` - Trade VaR contribution

### Valuation APIs
- `POST /api/valuation/batch` - Start batch valuation
- `GET /api/valuation/batch/runs` - List valuation runs
- `GET /api/valuation/pnl/{date}` - P&L for date
- `POST /api/valuation/pnl/calculate` - Calculate P&L
- `GET /api/valuation/pnl/{date}/attribution` - P&L breakdown
- `GET /api/valuation/pnl/{date}/unexplained` - Unexplained P&L

### Scenario APIs
- `POST /api/valuation/scenario` - Run scenario
- `GET /api/valuation/scenario/{id}` - Scenario results

### Trade APIs
- `GET /api/trades/search` - Search trades
- `GET /api/risk/trades/{tradeId}/history` - Trade versions
- `POST /api/trades/book-from-template` - Book trade

## 🎯 User Workflows Supported

### 1. Trader Workflow
1. Book trade from template ([ApprovalRulesConfig.jsx](src/components/ApprovalRulesConfig.jsx))
2. Search for existing trades ([TradeSearch.jsx](src/components/TradeSearch.jsx))
3. View trade history ([TradeHistory.jsx](src/components/TradeHistory.jsx))
4. Review approval status ([ApprovalDashboard.jsx](src/pages/risk/ApprovalDashboard.jsx))

### 2. Risk Manager Workflow
1. Review pending approvals ([ApprovalDashboard.jsx](src/pages/risk/ApprovalDashboard.jsx))
2. Approve/reject trades ([ApprovalDetail.jsx](src/pages/risk/ApprovalDetail.jsx))
3. Monitor positions ([PositionDashboard.jsx](src/pages/risk/PositionDashboard.jsx))
4. Check limit breaches ([BreachAlert.jsx](src/pages/risk/BreachAlert.jsx))
5. Calculate VaR ([VarDashboard.jsx](src/pages/risk/VarDashboard.jsx))
6. Configure limits ([LimitDashboard.jsx](src/pages/risk/LimitDashboard.jsx))

### 3. Operations Workflow
1. Run EOD batch valuation ([BatchValuation.jsx](src/pages/mo/BatchValuation.jsx))
2. Calculate daily P&L ([PnlDashboard.jsx](src/pages/mo/PnlDashboard.jsx))
3. Analyze P&L attribution ([PnlAttribution.jsx](src/pages/mo/PnlAttribution.jsx))
4. Run scenario analysis ([ScenarioBuilder.jsx](src/pages/mo/ScenarioBuilder.jsx))

## ✅ Testing Checklist

### Approval Workflow
- [ ] Load pending approvals
- [ ] Filter by status, role, portfolio, MTM
- [ ] Quick approve from dashboard
- [ ] Quick reject with reason
- [ ] View approval detail
- [ ] Approve with comments
- [ ] Reject with mandatory reason

### Position Management
- [ ] Load positions for date
- [ ] Filter by portfolio and commodity
- [ ] Calculate positions
- [ ] View summary cards
- [ ] Drill down to trades

### Limit Management
- [ ] View all limits with utilization
- [ ] Create new limit
- [ ] View breaches
- [ ] Resolve breach with notes
- [ ] Check traffic light indicators

### VaR Calculation
- [ ] Calculate portfolio VaR
- [ ] Change confidence level
- [ ] Change horizon
- [ ] View VaR ladder
- [ ] View CVaR

### Valuation & P&L
- [ ] Start batch valuation
- [ ] Monitor run status
- [ ] Calculate P&L
- [ ] View P&L breakdown
- [ ] View attribution waterfall

### Scenario Analysis
- [ ] Run preset scenario
- [ ] Create custom scenario
- [ ] View impact by trade
- [ ] Identify winners/losers

## 🔒 Security Considerations

### Authentication
- All API calls include authentication headers
- User info from localStorage
- Token-based authorization

### Authorization
- Role-based access control (TRADER, RISK_MANAGER, OPERATIONS)
- Self-approval blocked in backend

### Data Validation
- Form validation before submission
- Required fields enforced
- Type checking for numeric inputs

## 🎨 Customization Guide

### Changing Colors
Update Material-UI theme in `src/theme/endurTheme.js`

### Adding New Filters
1. Add to state: `const [filters, setFilters] = useState({ ... })`
2. Add TextField in filter section
3. Update filtering logic in component

### Adding New Columns to Tables
```javascript
{
  field: "myField",
  label: "My Label",
  sortable: true,
  render: (val, row) => <YourComponent value={val} />
}
```

## 📈 Performance Considerations

### Data Fetching
- Use `useEffect` cleanup for aborted requests
- Implement debouncing for search inputs
- Cache data when appropriate

### Re-renders
- Use `React.memo` for expensive components
- Implement pagination for large datasets
- Lazy load components with `React.lazy`

### Auto-refresh
- Clear intervals on unmount
- Configurable refresh rates
- Pause refresh when tab inactive

## 🐛 Troubleshooting

### "Failed to load data" errors
- Check backend is running on localhost:8080
- Verify authentication token in localStorage
- Check browser console for CORS errors

### Table not displaying
- Verify API returns array format
- Check column field names match data keys
- Ensure data has unique `id` field

### Charts not rendering
- Install recharts: `npm install recharts`
- Verify data structure matches chart requirements
- Check container width/height

## 📝 Next Steps

### Recommended Enhancements
1. **WebSocket Support**: Real-time updates without polling
2. **Export Functionality**: Export tables to Excel/CSV
3. **Mobile Views**: Dedicated mobile layouts
4. **Offline Mode**: Service workers for offline capability
5. **Advanced Charts**: More visualization options
6. **Bulk Operations**: Select multiple rows for batch actions
7. **User Preferences**: Save filter preferences
8. **Keyboard Shortcuts**: Power user features

### Additional Components to Consider
- Trade Amendment workflow
- Limit Configuration form
- Position Heatmap visualization
- Greeks Dashboard
- Credit Risk view
- Collateral Management

## 📚 Documentation References

- [Material-UI Documentation](https://mui.com/)
- [React Router Documentation](https://reactrouter.com/)
- [Recharts Documentation](https://recharts.org/)
- Backend API Swagger: http://localhost:8080/swagger-ui.html

---

**Status**: ✅ All 17 components complete and ready for integration

**Estimated Integration Time**: 2-4 hours for routing setup and testing

**Backend Compatibility**: Designed for Phase 1-3 backend APIs (100% coverage)
