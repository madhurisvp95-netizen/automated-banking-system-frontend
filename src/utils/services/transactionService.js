import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";
const TRANSACTIONS_ENDPOINT =
  process.env.REACT_APP_TRANSACTIONS_ENDPOINT || "/api/banking";
const TRANSACTION_HISTORY_ENDPOINT =
  process.env.REACT_APP_TRANSACTION_HISTORY_ENDPOINT || "/history";
const API_URL = TRANSACTIONS_ENDPOINT.startsWith("http")
  ? TRANSACTIONS_ENDPOINT
  : `${API_BASE_URL}${TRANSACTIONS_ENDPOINT}`;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const toNumber = (value) => Number(value);

const deposit = (amount) => {
  return apiClient.post("/deposit", { amount: toNumber(amount) });
};

const withdraw = (amount) => {
  return apiClient.post("/withdraw", { amount: toNumber(amount) });
};

const transfer = (toAccountNumber, amount) => {
  return apiClient.post("/transfer", {
    toAccountNumber,
    amount: toNumber(amount),
  });
};

const getTransactionHistory = () => {
  return apiClient.get(TRANSACTION_HISTORY_ENDPOINT);
};

const transactionService = {
  deposit,
  withdraw,
  transfer,
  getTransactionHistory
};

export default transactionService;
