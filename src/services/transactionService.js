import axios from "axios";

const API_URL = "http://localhost:8085/api/transactions";

const deposit = (accountId, amount) => {
  return axios.post(`${API_URL}/deposit`, null, {
    params: { accountId, amount }
  });
};

const withdraw = (accountId, amount) => {
  return axios.post(`${API_URL}/withdraw`, null, {
    params: { accountId, amount }
  });
};

const transfer = (fromAccountId, toAccountId, amount) => {
  return axios.post(`${API_URL}/transfer`, null, {
    params: { fromAccountId, toAccountId, amount }
  });
};

export default {
  deposit,
  withdraw,
  transfer
};