import React, { useState } from "react";

const CHATBOT_API_URL =
  process.env.REACT_APP_CHATBOT_API_URL || "http://localhost:5001/api/chatbot/message";

function getFallbackReply(rawMessage) {
  const message = (rawMessage || "").toLowerCase().trim();

  if (!message) {
    return "Please type your question and I will help you.";
  }

  if (message.includes("deposit")) {
    return "Open Transactions > Deposit, enter amount, and submit. Your balance should refresh after success.";
  }

  if (message.includes("withdraw")) {
    return "Open Transactions > Withdrawal, enter amount, and submit. Withdrawal works for the logged-in user account.";
  }

  if (message.includes("transfer")) {
    return "Open Transactions > Transfer, enter destination account number and amount, then submit.";
  }

  if (message.includes("ticket") || message.includes("support")) {
    return "Open Customer Support > Create Ticket, add subject and issue details, then create the ticket.";
  }

  if (
    message.includes("balance") ||
    message.includes("account") ||
    message.includes("address") ||
    message.includes("phone")
  ) {
    return "Your profile card on dashboard shows account number, address, phone number, and updated balance.";
  }

  if (message.includes("hello") || message.includes("hi")) {
    return "Hello! I can help with deposit, withdrawal, transfer, profile details, and support tickets.";
  }

  return "I can help with transactions, profile details, and support tickets. Ask me what you want to do.";
}

function CustomerServiceChat() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hello! I can help with deposits, withdrawals, transfers, profile details, and support tickets.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const nextMessages = [...messages, { role: "user", text: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(CHATBOT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Chat service unavailable");
      }

      const data = await response.json();
      const reply = data?.reply || getFallbackReply(trimmed);
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: getFallbackReply(trimmed),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="chat-widget">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`chat-message ${message.role === "user" ? "user" : "bot"}`}
          >
            {message.text}
          </div>
        ))}
        {isLoading && <div className="chat-message bot">Typing...</div>}
      </div>

      <div className="chat-input-row">
        <input
          type="text"
          placeholder="Type your question..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}

export default CustomerServiceChat;
