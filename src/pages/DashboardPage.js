import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import transactionService from "../services/transactionService";
import CustomerServiceChat from "../components/CustomerServiceChat";
import "./DashboardPage.css";

const VALID_TABS = ["deposit", "withdraw", "transfer", "bill"];

function DashboardPage() {
  const navigate = useNavigate();
  const { tab } = useParams();
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const activeTab = VALID_TABS.includes(tab) ? tab : "deposit";

  const clearFields = () => {
    setAccountId("");
    setAmount("");
    setToAccountId("");
  };

  useEffect(() => {
    if (!tab || !VALID_TABS.includes(tab)) {
      navigate("/dashboard/deposit", { replace: true });
      return;
    }
  }, [tab, navigate]);

  useEffect(() => {
    clearFields();
  }, [activeTab]);

  const handleDeposit = async () => {
    try {
      await transactionService.deposit(accountId, amount);
      alert("Deposit successful!");
    } catch (error) {
      alert("Deposit failed: " + error.message);
    }
  };

  const handleWithdraw = async () => {
    try {
      await transactionService.withdraw(accountId, amount);
      alert("Withdrawal successful!");
    } catch (error) {
      alert("Withdrawal failed: " + error.message);
    }
  };

  const handleTransfer = async () => {
    try {
      await transactionService.transfer(accountId, toAccountId, amount);
      alert("Transfer successful!");
    } catch (error) {
      alert("Transfer failed: " + error.message);
    }
  };

  const handleBillPayment = async () => {
    try {
      await transactionService.billPayment(accountId, amount);
      alert("Bill Payment successful!");
    } catch (error) {
      alert("Bill Payment failed: " + error.message);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "deposit":
        return (
          <div>
            <h3>Deposit</h3>
             <input
        placeholder="Account Number"
        value={accountId}
        onChange={(e) => setAccountId(e.target.value)}
      />

      <input
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
            <button onClick={handleDeposit}>Deposit</button>
          </div>
        );
      case "withdraw":
        return (
          <div>
            <h3>Withdrawal</h3>
             <input
        placeholder="Account Number"
        value={accountId}
        onChange={(e) => setAccountId(e.target.value)}
      />

      <input
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
            <button onClick={handleWithdraw}>Withdraw</button>
          </div>
        );
      case "transfer":
        return (
          <div>
            <h3>Transfer</h3>
            <input placeholder="From Account" value={accountId} onChange={(e) => setAccountId(e.target.value)}/>
            <input placeholder="To Account"  value={toAccountId} onChange={(e) => setToAccountId(e.target.value)} />
            <input placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <button onClick={handleTransfer}>Transfer</button>
          </div>
        );
      case "bill":
        return (
          <div>
            <h3>Bill Payment</h3>
            <input
              placeholder="Account Number"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
            />
            <input
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <button onClick={handleBillPayment}>Pay Bill</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* Left Section */}
      <div style={{ width: "70%", padding: "20px", borderRight: "1px solid gray" }}>
        <h2>Transaction Module</h2>

        <div style={{ marginBottom: "20px" }}>
          <ul className="transaction-list">
            <li className="transaction-list-item">
              <NavLink
                to="/dashboard/deposit"
                className={({ isActive }) =>
                  `transaction-link${isActive ? " active" : ""}`
                }
              >
                Deposit
              </NavLink>
            </li>
            <li className="transaction-list-item">
              <NavLink
                to="/dashboard/withdraw"
                className={({ isActive }) =>
                  `transaction-link${isActive ? " active" : ""}`
                }
              >
                Withdrawal
              </NavLink>
            </li>
            <li className="transaction-list-item">
              <NavLink
                to="/dashboard/transfer"
                className={({ isActive }) =>
                  `transaction-link${isActive ? " active" : ""}`
                }
              >
                Transfer
              </NavLink>
            </li>
            <li className="transaction-list-item">
              <NavLink
                to="/dashboard/bill"
                className={({ isActive }) =>
                  `transaction-link${isActive ? " active" : ""}`
                }
              >
                Bill Payment
              </NavLink>
            </li>
          </ul>
        </div>

        {renderContent()}
      </div>

      {/* Right Section */}
      <div style={{ width: "30%", padding: "20px" }}>
        <h2>Customer Services</h2>
        <CustomerServiceChat />
      </div>

    </div>
  );
}

export default DashboardPage;
