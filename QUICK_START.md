# Quick Start Guide - CTRM Simulator UI

## ✅ What's Been Built

**17 Production-Ready Components** covering:
- ✅ Approval Workflow (2 components)
- ✅ Trade Management (2 components)  
- ✅ Position Management (1 component)
- ✅ Risk Limits & Breaches (2 components)
- ✅ VaR Calculation (1 component)
- ✅ Batch Valuation (1 component)
- ✅ P&L Management (2 components)
- ✅ Scenario Analysis (1 component)
- ✅ Shared Utilities (4 components)

## 🚀 Getting Started (5 Minutes)

### Step 1: Verify Dependencies ✅
All required packages are already installed:
```bash
npm list react-router-dom recharts @mui/material
```

### Step 2: Update App.js Routing

Replace your `src/App.js` with:

```javascript
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Existing components
import AuthPage from "./pages/AuthPage";
import TradeBooking from "./pages/fo/TradeBooking";
import TradeStatusOverview from "./pages/mo/TradeStatusOverview";
import LifecycleMonitor from "./pages/mo/LifecycleMonitor";
import ConfigDashboard from "./pages/config/ConfigDashboard";
import CounterPartiesConfig from "./pages/config/CounterPartiesConfig";
import InstrumentConfig from "./pages/config/InstrumentConfig";
import PortfolioConfig from "./pages/config/PortfolioConfig";

// NEW: Risk Management Components
import ApprovalDashboard from "./pages/risk/ApprovalDashboard";
import ApprovalDetail from "./pages/risk/ApprovalDetail";
import PositionDashboard from "./pages/risk/PositionDashboard";
import LimitDashboard from "./pages/risk/LimitDashboard";
import BreachAlert from "./pages/risk/BreachAlert";
import VarDashboard from "./pages/risk/VarDashboard";

// NEW: Operations Components
import BatchValuation from "./pages/mo/BatchValuation";
import PnlDashboard from "./pages/mo/PnlDashboard";
import PnlAttribution from "./pages/mo/PnlAttribution";
import ScenarioBuilder from "./pages/mo/ScenarioBuilder";

// NEW: Trade Components
import TradeSearch from "./components/TradeSearch";
import TradeHistory from "./components/TradeHistory";

// Layout
import MainLayout from "./layout/MainLayout";

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected Routes with Layout */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  {/* Front Office */}
                  <Route path="/fo/trade-booking" element={<TradeBooking />} />
                  <Route path="/trades/search" element={<TradeSearch />} />
                  <Route path="/trade/:tradeId/history" element={<TradeHistory />} />

                  {/* Risk Management */}
                  <Route path="/risk/approvals" element={<ApprovalDashboard />} />
                  <Route path="/risk/approval/:approvalId" element={<ApprovalDetail />} />
                  <Route path="/risk/positions" element={<PositionDashboard />} />
                  <Route path="/risk/limits" element={<LimitDashboard />} />
                  <Route path="/risk/breaches" element={<BreachAlert />} />
                  <Route path="/risk/var" element={<VarDashboard />} />

                  {/* Middle Office */}
                  <Route path="/mo/trade-status" element={<TradeStatusOverview />} />
                  <Route path="/mo/lifecycle" element={<LifecycleMonitor />} />
                  <Route path="/mo/batch-valuation" element={<BatchValuation />} />
                  <Route path="/mo/pnl" element={<PnlDashboard />} />
                  <Route path="/mo/pnl-attribution" element={<PnlAttribution />} />
                  <Route path="/mo/scenarios" element={<ScenarioBuilder />} />

                  {/* Configuration */}
                  <Route path="/config" element={<ConfigDashboard />} />
                  <Route path="/config/counterparties" element={<CounterPartiesConfig />} />
                  <Route path="/config/instruments" element={<InstrumentConfig />} />
                  <Route path="/config/portfolios" element={<PortfolioConfig />} />

                  {/* Default */}
                  <Route path="/" element={<Navigate to="/risk/approvals" />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

### Step 3: Update Navigation Menu

Update your `src/layout/MainLayout.jsx` navigation items:

```javascript
const menuItems = [
  {
    title: "Front Office",
    items: [
      { label: "Book Trade", path: "/fo/trade-booking", icon: "📝" },
      { label: "Search Trades", path: "/trades/search", icon: "🔍" },
    ]
  },
  {
    title: "Risk Management",
    items: [
      { label: "Approval Queue", path: "/risk/approvals", icon: "✅" },
      { label: "Positions", path: "/risk/positions", icon: "📊" },
      { label: "Risk Limits", path: "/risk/limits", icon: "🚦" },
      { label: "Breaches", path: "/risk/breaches", icon: "🚨" },
      { label: "VaR", path: "/risk/var", icon: "📈" },
    ]
  },
  {
    title: "Operations",
    items: [
      { label: "Trade Status", path: "/mo/trade-status", icon: "📋" },
      { label: "Lifecycle", path: "/mo/lifecycle", icon: "♻️" },
      { label: "Batch Valuation", path: "/mo/batch-valuation", icon: "🔄" },
      { label: "P&L", path: "/mo/pnl", icon: "💰" },
      { label: "P&L Attribution", path: "/mo/pnl-attribution", icon: "📊" },
      { label: "Scenarios", path: "/mo/scenarios", icon: "🎭" },
    ]
  },
  {
    title: "Configuration",
    items: [
      { label: "Dashboard", path: "/config", icon: "⚙️" },
      { label: "Counterparties", path: "/config/counterparties", icon: "🏢" },
      { label: "Instruments", path: "/config/instruments", icon: "🎯" },
      { label: "Portfolios", path: "/config/portfolios", icon: "💼" },
    ]
  }
];
```

### Step 4: Start the Application

```bash
npm start
```

The app will open at http://localhost:3000

## 🎯 Testing Each Component

### 1. Approval Workflow
1. Navigate to `/risk/approvals`
2. You should see pending approvals with filters
3. Click on a row to see [ApprovalDetail.jsx](src/pages/risk/ApprovalDetail.jsx)
4. Test approve/reject actions

### 2. Trade Management
1. Navigate to `/trades/search`
2. Enter search criteria (portfolio, counterparty, etc.)
3. Click on a trade to view history at `/trade/{id}/history`

### 3. Position Management
1. Navigate to `/risk/positions`
2. Select a date
3. Click "Calculate Positions"
4. View aggregated positions by portfolio/commodity

### 4. Risk Limits
1. Navigate to `/risk/limits`
2. Click "New Limit" to create a limit
3. View utilization gauges
4. Navigate to `/risk/breaches` for active breaches

### 5. VaR Calculation
1. Navigate to `/risk/var`
2. Enter portfolio name
3. Select confidence level and horizon
4. Click "Calculate VaR"

### 6. Batch Valuation
1. Navigate to `/mo/batch-valuation`
2. Select valuation date
3. Click "Start Valuation"
4. Watch run status update

### 7. P&L Management
1. Navigate to `/mo/pnl`
2. Select date
3. Click "Calculate P&L"
4. View breakdown by portfolio
5. Navigate to `/mo/pnl-attribution` for detailed breakdown

### 8. Scenario Analysis
1. Navigate to `/mo/scenarios`
2. Choose a preset scenario OR
3. Build custom scenario
4. Click "Run Scenario"
5. View portfolio impact

## 📋 Pre-Flight Checklist

Before going live, verify:

- [ ] Backend running on http://localhost:8080
- [ ] User logged in (localStorage has 'user' and 'token')
- [ ] All routes accessible from navigation
- [ ] API endpoints returning data
- [ ] Error messages display properly
- [ ] Loading spinners show during API calls
- [ ] Toast notifications appear on success/error
- [ ] Tables sort and filter correctly
- [ ] Forms validate input
- [ ] Confirmation dialogs work

## 🔧 Configuration

### API Base URL
Update in each component if needed:
```javascript
const BASE_URL = "http://localhost:8080/api";
```

Or create a config file:
```javascript
// src/config/api.js
export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";
```

### Authentication Headers
All components use:
```javascript
const user = JSON.parse(localStorage.getItem("user") || "{}");
const token = localStorage.getItem("token");

headers: {
  "X-User-Name": user.username || "",
  "X-User-Role": user.role || "",
  "Authorization": token ? `Bearer ${token}` : ""
}
```

## 🐛 Common Issues & Solutions

### Issue: "Module not found: Can't resolve 'recharts'"
**Solution**: 
```bash
npm install recharts
```

### Issue: "Cannot read property 'map' of undefined"
**Solution**: Check API is returning array format. Add null check:
```javascript
{data && data.map(item => ...)}
```

### Issue: Routes not working
**Solution**: Ensure `react-router-dom` v6+ is installed and BrowserRouter wraps App

### Issue: CORS errors
**Solution**: Backend must allow localhost:3000. Check Spring Boot CORS config.

## 📊 Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
API Call (fetch)
    ↓
Backend Endpoint
    ↓
Response
    ↓
Update Component State
    ↓
Re-render UI
    ↓
Show Toast Notification
```

## 🎨 Styling Guide

All components use Material-UI v7 with consistent patterns:

### Colors
- Success: `success.main` (green)
- Error: `error.main` (red)
- Warning: `warning.main` (orange)
- Primary: `primary.main` (blue)

### Spacing
- Container padding: `sx={{ p: 3 }}`
- Card spacing: `sx={{ mb: 3 }}`
- Stack spacing: `spacing={2}`

### Typography
- Page title: `variant="h4"`
- Section title: `variant="h6"`
- Body text: `variant="body1"`

## 📈 Performance Tips

1. **Pagination**: All tables use pagination (10-25 rows per page)
2. **Lazy Loading**: Consider code-splitting for large components
3. **Memoization**: Use React.memo for expensive renders
4. **Debouncing**: Add to search inputs
5. **Caching**: Consider React Query for server state

## 🔐 Security Notes

- Never store sensitive data in localStorage (only user/token)
- All API calls require authentication
- Role-based access enforced on backend
- Input validation on forms
- Confirmation for destructive actions

## 📚 Additional Resources

- [Full Component Documentation](UI_COMPONENTS_DOCUMENTATION.md)
- [Material-UI Docs](https://mui.com/)
- [React Router Docs](https://reactrouter.com/)
- Backend API: http://localhost:8080/swagger-ui.html

## 🎉 You're All Set!

All 17 components are ready to use. Navigate through the app and explore:

1. **Start with Approvals** - Most critical workflow
2. **Try Position Dashboard** - See risk aggregation
3. **Test Batch Valuation** - Run EOD process
4. **Explore Scenarios** - What-if analysis

Happy Trading! 🚀
