import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Error Boundary
import ErrorBoundary from "./components/ErrorBoundary";

// Existing components
import AuthPage from "./pages/AuthPage";
import TradeBooking from "./pages/fo/TradeBooking";
import TradeStatusOverview from "./pages/mo/TradeStatusOverview";
import LifecycleMonitor from "./pages/mo/LifecycleMonitor";
import ConfigDashboard from "./pages/config/ConfigDashboard";
import CounterPartiesConfig from "./pages/config/CounterPartiesConfig";
import InstrumentConfig from "./pages/config/InstrumentConfig";
import PortfolioConfig from "./pages/config/PortfolioConfig";
import DealTemplateConfig from "./components/DealTemplateConfig";
import LifecycleRulesConfig from "./components/LifecycleRulesConfig";
import ApprovalRulesConfig from "./components/ApprovalRulesConfig";

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
    <ErrorBoundary>
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
                  <Route path="/config/templates" element={<DealTemplateConfig />} />
                  <Route path="/config/lifecycle" element={<LifecycleRulesConfig />} />
                  <Route path="/config/approvals" element={<ApprovalRulesConfig />} />

                  {/* Default */}
                  <Route path="/" element={<Navigate to="/risk/approvals" />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;