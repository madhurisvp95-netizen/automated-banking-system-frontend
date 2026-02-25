import React, { useState } from "react";

const CHATBOT_API_URL =
  process.env.REACT_APP_CHATBOT_API_URL || "http://localhost:5001/api/chatbot/message";

function CustomerServiceChat() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hello! I can help with deposits, withdrawals, transfers, and bill payments.",
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
      const response = await fetch(CHATBOT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok) {
        throw new Error("Chat service unavailable");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "I am temporarily unavailable. Please try again shortly.",
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
