import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layout/MainLayout";

import AuthPage from "./pages/AuthPage";
import TradeBooking from "./pages/fo/TradeBooking";
import ApprovalDashboard from "./pages/risk/ApprovalDashboard";
import TradeStatusOverview from "./pages/mo/TradeStatusOverview";
import ConfigDashboard from "./pages/config/ConfigDashboard";
import InstrumentConfig from "./pages/config/InstrumentConfig.jsx";
import CounterPartiesConfig from "./pages/config/CounterPartiesConfig.jsx";
import PortfolioConfig from "./pages/config/PortfolioConfig.jsx";
import ApprovalRulesConfig from "./components/ApprovalRulesConfig.jsx";
import DealTemplateConfig from "./components/DealTemplateConfig.jsx";
import LIfecycleRulesConfig from "./components/LifecycleRulesConfig.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth page without MainLayout */}
        <Route path="/" element={<AuthPage />} />
        <Route path="/auth" element={<AuthPage />} />
        
        {/* Main app routes with layout */}
        <Route path="/*" element={
          <MainLayout>
            <Routes>
              <Route path="/config/instruments" element={<InstrumentConfig />} /> 
              <Route path="/config/counterparties" element={<CounterPartiesConfig />} /> 
              <Route path="/config/portfolios" element={<PortfolioConfig />} /> 
              <Route path="/config/templates" element={<DealTemplateConfig />} /> 
              <Route path="/config/lifecycle" element={<LIfecycleRulesConfig />} /> 
              <Route path="/config/approvals" element={<ApprovalRulesConfig />} /> 
              <Route path="/config" element={<ConfigDashboard />} /> 
              <Route path="/fo" element={<TradeBooking />} />
              <Route path="/mo" element={<TradeStatusOverview />} /> 
              <Route path="/risk" element={<ApprovalDashboard />} />
            </Routes>
          </MainLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}
