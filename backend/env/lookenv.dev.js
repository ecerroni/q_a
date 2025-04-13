module.exports = {
  // API_AWS_ACCESS_KEY_ID: {
  //   default: "",
  // },
  // API_AWS_SECRET_ACCESS_KEY: {
  //   default: "",
  // },
  API_DB_CONNECTION_STRING: {
    default: "mongodb://127.0.0.1:27017/qa",
  },
  API_AUTH_SECRET_TOKEN: {
    default: "1234",
  },
  API_AUTH_SECRET_REFRESH_TOKEN: {
    default: "123456789",
  },
  API_HTTP_LOG_SERVER_URL: "",
  API_AUTH_ENDPOINT: "localhost",
  API_OPEN_AI_ENDPOINT: {
    default: "https://openrouter.ai/api/v1",
  },
  API_OPEN_AI_KEY: {
    required: true,
  },
  API_OPEN_AI_MODEL: {
    default: "meta-llama/llama-3.3-70b-instruct:free",
  },
};
