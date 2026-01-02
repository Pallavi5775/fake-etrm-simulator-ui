import httpClient from "./httpClient";

/* =========================
   FRONT OFFICE (FO)
   ========================= */

/**
 * Fetch deal templates for booking
 */
export async function fetchDealTemplates() {
  try {
    const res = await httpClient.get("/templates");
    return res.data;
  } catch (err) {
    console.error("Failed to fetch deal templates:", err);
    throw new Error(err.message === "Failed to fetch" 
      ? "Cannot connect to backend. Please ensure the server is running."
      : err.message);
  }
}

/**
 * Book trade from template
 */
export async function bookTradeFromTemplate(payload) {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const token = localStorage.getItem("token");
    
    const res = await fetch("http://localhost:8080/api/trades/book-from-template", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Name": user.username || "",
        "X-User-Role": user.role || "",
        "Authorization": token ? `Bearer ${token}` : ""
      },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Booking failed (HTTP ${res.status}): ${errorText}`);
    }
    
    return res.json();
  } catch (err) {
    console.error("Error booking trade:", err);
    if (err.message === "Failed to fetch") {
      throw new Error("Cannot connect to backend. Please ensure the server is running at http://localhost:8080");
    }
    throw err;
  }
}

/* =========================
   MIDDLE OFFICE (MO)
   ========================= */

/**
 * Fetch all trades (lifecycle monitor)
 */
export async function fetchAllTrades() {
  const res = await httpClient.get("/trades");
  return res.data;
}

/* =========================
   RISK (Approvals & Valuation)
   ========================= */

/**
 * Fetch trades pending approval
 */
export async function fetchPendingApprovals() {
  const res = await httpClient.get("ui/trades/pending-approvals");
  return res.data;
}

/**
 * Approve trade
 */
export async function approveTrade(tradeId) {
  // Get current user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  const res = await httpClient.post(
    `/approvals/${tradeId}/approve`,
    {
      role: user.role || "UNKNOWN",
      approvedBy: user.username || "UNKNOWN"
    }
  );
  return res.data;
}

/**
 * Reject trade
 */
export async function rejectTrade(tradeId, reason) {
  // Get current user from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  
  const res = await httpClient.post(
    `/approvals/${tradeId}/reject`,
    {
      reason: reason || "Rejected by approver",
      rejectedBy: user.username || "UNKNOWN"
    }
  );
  return res.data;
}




export async function fetchApprovedTrades() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  
  const res = await fetch(
    "http://localhost:8080/api/trades?status=APPROVED",
    {
      headers: {
        "Content-Type": "application/json",
        "X-User-Name": user.username || "",
        "X-User-Role": user.role || "",
        "Authorization": token ? `Bearer ${token}` : ""
      }
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch approved trades");
  }

  return res.json();
}

export async function fetchRejectedTrades() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  
  const res = await fetch(
    "http://localhost:8080/api/trades?status=REJECTED",
    {
      headers: {
        "Content-Type": "application/json",
        "X-User-Name": user.username || "",
        "X-User-Role": user.role || "",
        "Authorization": token ? `Bearer ${token}` : ""
      }
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch rejected trades");
  }

  return res.json();
}

/* =========================
   VALUATION & PnL
   ========================= */

/**
 * Fetch MTM valuation history (for chart)
 */
export async function fetchValuationHistory(tradeId) {
  const res = await httpClient.get(`/trades/${tradeId}/valuations`);
  return res.data;
}

/**
 * Fetch daily PnL
 */
export async function fetchPnL(tradeId) {
  const res = await httpClient.get(`/trades/${tradeId}/pnl`);
  return res.data;
}
