const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.CHATBOT_PORT || 5001;

app.use(cors());
app.use(express.json());

function getBotReply(rawMessage) {
  const message = (rawMessage || '').toLowerCase();

  if (!message.trim()) {
    return 'Please enter a message so I can help you.';
  }

  if (message.includes('deposit')) {
    return 'To deposit money, open Transactions > Deposit, enter amount, and submit.';
  }

  if (message.includes('withdraw')) {
    return 'For withdrawal, open Transactions > Withdrawal, enter amount, and submit.';
  }

  if (message.includes('transfer')) {
    return 'For transfer, open Transactions > Transfer, enter destination account number and amount, then submit.';
  }

  if (message.includes('bill')) {
    return 'Bill payment is not available in the current application.';
  }

  if (message.includes('ticket') || message.includes('support')) {
    return 'Open Customer Support > Create Ticket, add subject and issue details, then create the ticket.';
  }

  if (
    message.includes('balance') ||
    message.includes('account') ||
    message.includes('address') ||
    message.includes('phone')
  ) {
    return 'Your dashboard profile card shows account number, address, phone number, and current balance.';
  }

  if (message.includes('hello') || message.includes('hi')) {
    return 'Hello! Ask me about deposits, withdrawals, transfers, profile details, or support tickets.';
  }

  return 'I can help with transactions, profile details, and support tickets.';
}

app.get('/api/chatbot/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/chatbot/message', (req, res) => {
  const { message } = req.body || {};
  const reply = getBotReply(message);
  res.json({ reply });
});

app.listen(PORT, () => {
  console.log(`Chatbot server running on http://localhost:${PORT}`);
});
