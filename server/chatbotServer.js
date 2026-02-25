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
    return 'To deposit money, open the Deposit section in Transaction Module, enter account number and amount, then submit.';
  }

  if (message.includes('withdraw')) {
    return 'For withdrawal, use the Withdrawal section, provide account number and amount, then confirm.';
  }

  if (message.includes('transfer')) {
    return 'For transfer, enter source account, destination account, and amount in the Transfer section.';
  }

  if (message.includes('bill')) {
    return 'For bill payment, open Bill Payment in Transaction Module and complete account plus amount details.';
  }

  if (message.includes('hello') || message.includes('hi')) {
    return 'Hello! Ask me about deposits, withdrawals, transfers, or bill payments.';
  }

  return 'I can help with deposit, withdrawal, transfer, and bill payment questions.';
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
