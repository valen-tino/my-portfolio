// Catch-all API function that forwards all /api/* routes to the Express app
const app = require('./serverless');

module.exports = (req, res) => {
  return app(req, res);
};

