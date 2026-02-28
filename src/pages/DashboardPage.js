import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import authService from "../utils/services/authService";
import transactionService from "../utils/services/transactionService";
import CustomerServiceChat from "../components/CustomerServiceChat";
import "./DashboardPage.css";

const VALID_TRANSACTION_TABS = ["deposit", "withdraw", "transfer", "history"];

function DashboardPage() {
  const navigate = useNavigate();
  const { tab } = useParams();

  const [amount, setAmount] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState("deposit");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [tickets, setTickets] = useState([]);
  const [historyItems, setHistoryItems] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const selectedRole = (localStorage.getItem("selectedRole") || "").toLowerCase();
  const apiRole = (currentUser?.role || "").toUpperCase();
  const isUserRole = selectedRole === "user" || apiRole === "USER";

  useEffect(() => {
    let isMounted = true;
    const loadUserDetails = async () => {
      const cachedUser = authService.getCurrentUser();
      if (isMounted) {
        setCurrentUser(cachedUser);
      }

      if (!isUserRole) {
        return;
      }

      try {
        const detailedUser = await authService.fetchUserDashboardDetails();
        if (isMounted) {
          setCurrentUser(detailedUser);
        }
      } catch (error) {
        // Keep cached user details if enrichment fails
      }
    };

    loadUserDetails();
    return () => {
      isMounted = false;
    };
  }, [isUserRole]);

  useEffect(() => {
    if (!tab || !VALID_TRANSACTION_TABS.includes(tab)) {
      navigate("/dashboard/deposit", { replace: true });
      setActiveView("deposit");
      return;
    }

    setActiveView(tab);
  }, [tab, navigate]);

  const clearTransactionFields = () => {
    setAmount("");
    setToAccountId("");
  };

  const selectTransactionView = (view) => {
    setActiveView(view);
    navigate(`/dashboard/${view}`);
    clearTransactionFields();
    if (view === "history") {
      loadTransactionHistory();
    }
  };

  const selectSupportView = (view) => {
    setActiveView(view);
    clearTransactionFields();
  };

  const handleDeposit = async () => {
    try {
      const response = await transactionService.deposit(amount);
      updateUserFromTransactionResponse(response?.data);
      loadTransactionHistory();
      alert("Deposit successful!");
    } catch (error) {
      alert("Deposit failed: " + error.message);
    }
  };

  const handleWithdraw = async () => {
    try {
      const response = await transactionService.withdraw(amount);
      updateUserFromTransactionResponse(response?.data);
      loadTransactionHistory();
      alert("Withdrawal successful!");
    } catch (error) {
      alert("Withdrawal failed: " + error.message);
    }
  };

  const handleTransfer = async () => {
    try {
      const response = await transactionService.transfer(toAccountId, amount);
      updateUserFromTransactionResponse(response?.data);
      loadTransactionHistory();
      alert("Transfer successful!");
    } catch (error) {
      alert("Transfer failed: " + error.message);
    }
  };

  const extractAccountFromText = (value) => {
    if (!value) {
      return "";
    }
    const match = String(value).match(/AC\d{6,}/i);
    return match ? match[0] : "";
  };

  const normalizeHistoryItemAccounts = (item) => {
    const type = String(item.type || "").toUpperCase();
    const isTransfer = type.includes("TRANSFER");

    if (!isTransfer) {
      return { from: "-", to: "-" };
    }

    const parsedFrom = item.fromAccount || extractAccountFromText(item.description);
    const parsedTo = item.toAccount || extractAccountFromText(item.description);

    return {
      from: parsedFrom || currentUser?.accountNumber || "-",
      to: parsedTo || "-",
    };
  };

  const normalizeHistoryItems = (payload) => {
    const source =
      (Array.isArray(payload) && payload) ||
      payload?.transactions ||
      payload?.history ||
      payload?.content ||
      [];

    if (!Array.isArray(source)) {
      return [];
    }

    return source.map((item, index) => ({
      id: item.id ?? item.transactionId ?? `${index}`,
      type: item.type ?? item.transactionType ?? "UNKNOWN",
      amount: item.amount ?? item.transactionAmount ?? 0,
      fromAccount:
        item.fromAccountNumber ??
        item.senderAccountNumber ??
        item.fromAccount ??
        "",
      toAccount:
        item.toAccountNumber ??
        item.receiverAccountNumber ??
        item.toAccount ??
        "",
      time:
        item.timestamp ??
        item.dateTime ??
        item.createdAt ??
        item.transactionDate ??
        item.date ??
        "",
      description:
        item.description ??
        item.note ??
        item.remarks ??
        item.toAccountNumber ??
        "",
    }));
  };

  const loadTransactionHistory = async () => {
    setIsHistoryLoading(true);
    setHistoryError("");
    try {
      const response = await transactionService.getTransactionHistory();
      const normalizedItems = normalizeHistoryItems(response?.data);
      setHistoryItems(normalizedItems);
    } catch (error) {
      setHistoryItems([]);
      setHistoryError(
        error.response?.data?.error ||
          error.message ||
          "Unable to fetch transaction history"
      );
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const formatHistoryAccountValue = (item, side) => {
    const accounts = normalizeHistoryItemAccounts(item);
    return side === "from" ? accounts.from : accounts.to;
  };

  const updateUserFromTransactionResponse = (data) => {
    if (!data || typeof data !== "object") {
      return;
    }

    const updatedUser = {
      ...(currentUser || {}),
      username: data.username ?? currentUser?.username,
      accountNumber: data.accountNumber ?? currentUser?.accountNumber,
      address: data.address ?? currentUser?.address,
      phoneNumber: data.phoneNumber ?? currentUser?.phoneNumber,
      accountBalance:
        data.accountBalance ?? data.balance ?? currentUser?.accountBalance,
    };

    setCurrentUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      alert("Please enter ticket subject and description");
      return;
    }

    const newTicket = {
      id: Date.now(),
      subject: ticketSubject.trim(),
      description: ticketDescription.trim(),
      status: "Open",
    };

    setTickets((prev) => [newTicket, ...prev]);
    setTicketSubject("");
    setTicketDescription("");
    alert("Ticket created successfully");
  };

  const renderTransactionContent = () => {
    if (activeView === "deposit") {
      return (
        <div className="content-card">
          <h3>Deposit</h3>
          <input
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={handleDeposit}>Deposit</button>
        </div>
      );
    }

    if (activeView === "withdraw") {
      return (
        <div className="content-card">
          <h3>Withdrawal</h3>
          <input
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={handleWithdraw}>Withdraw</button>
        </div>
      );
    }

    if (activeView === "transfer") {
      return (
        <div className="content-card">
          <h3>Transfer</h3>
          <input
            placeholder="To Account Number"
            value={toAccountId}
            onChange={(e) => setToAccountId(e.target.value)}
          />
          <input
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={handleTransfer}>Transfer</button>
        </div>
      );
    }

    if (activeView === "history") {
      return (
        <div className="content-card">
          <div className="history-header">
            <h3>Transaction History</h3>
            <button type="button" onClick={loadTransactionHistory}>
              Refresh
            </button>
          </div>

          {isHistoryLoading && <p>Loading history...</p>}
          {!isHistoryLoading && historyError && (
            <p className="history-error">{historyError}</p>
          )}
          {!isHistoryLoading && !historyError && historyItems.length === 0 && (
            <p>No transactions found.</p>
          )}

          {!isHistoryLoading && historyItems.length > 0 && (
            <div className="history-table-wrap">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>From Account</th>
                    <th>To Account</th>
                    <th>Time</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {historyItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.type}</td>
                      <td>{item.amount}</td>
                      <td>{formatHistoryAccountValue(item, "from")}</td>
                      <td>{formatHistoryAccountValue(item, "to")}</td>
                      <td>{item.time || "-"}</td>
                      <td>{item.description || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const renderSupportContent = () => {
    if (activeView === "chat") {
      return (
        <div className="content-card">
          <h3>Chat With Support</h3>
          <CustomerServiceChat />
        </div>
      );
    }

    if (activeView === "ticket") {
      return (
        <div className="content-card">
          <h3>Create Ticket</h3>
          <form onSubmit={handleCreateTicket} className="ticket-form">
            <input
              type="text"
              placeholder="Ticket Subject"
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
            />
            <textarea
              placeholder="Describe your issue"
              value={ticketDescription}
              onChange={(e) => setTicketDescription(e.target.value)}
              rows={4}
            />
            <button type="submit">Create Ticket</button>
          </form>

          {tickets.length > 0 && (
            <div className="ticket-list">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="ticket-item">
                  <p><strong>{ticket.subject}</strong></p>
                  <p>{ticket.description}</p>
                  <span className="ticket-status">{ticket.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const isSupportView = activeView === "chat" || activeView === "ticket";

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <h2>Dashboard</h2>

        <div className="menu-group">
          <button type="button" className="menu-title">Transactions</button>
          <div className="submenu">
            <button
              type="button"
              className={activeView === "deposit" ? "active" : ""}
              onClick={() => selectTransactionView("deposit")}
            >
              Deposit
            </button>
            <button
              type="button"
              className={activeView === "withdraw" ? "active" : ""}
              onClick={() => selectTransactionView("withdraw")}
            >
              Withdrawal
            </button>
            <button
              type="button"
              className={activeView === "transfer" ? "active" : ""}
              onClick={() => selectTransactionView("transfer")}
            >
              Transfer
            </button>
            <button
              type="button"
              className={activeView === "history" ? "active" : ""}
              onClick={() => selectTransactionView("history")}
            >
              Transaction History
            </button>
          </div>
        </div>

        <div className="menu-group">
          <button type="button" className="menu-title">Customer Support</button>
          <div className="submenu">
            <button
              type="button"
              className={activeView === "chat" ? "active" : ""}
              onClick={() => selectSupportView("chat")}
            >
              Chat With User
            </button>
            <button
              type="button"
              className={activeView === "ticket" ? "active" : ""}
              onClick={() => selectSupportView("ticket")}
            >
              Create Ticket
            </button>
          </div>
        </div>
      </aside>

      <main className="dashboard-content">
        {isUserRole && currentUser && (
          <div className="user-profile-card">
            <h3>User Details</h3>
            <p><strong>Username:</strong> {currentUser.username || "-"}</p>
            <p><strong>Account Number:</strong> {currentUser.accountNumber || "-"}</p>
            <p><strong>Address:</strong> {currentUser.address || "-"}</p>
            <p><strong>Phone Number:</strong> {currentUser.phoneNumber || "-"}</p>
            <p><strong>Balance:</strong> {currentUser.accountBalance ?? currentUser.balance ?? "-"}</p>
          </div>
        )}

        {isSupportView ? renderSupportContent() : renderTransactionContent()}
      </main>
    </div>
  );
}

export default DashboardPage;
