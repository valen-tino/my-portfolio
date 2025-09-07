// This file serves as the main entry point for Vercel Serverless Functions
const app = require('./serverless');

// Export a handler function that forwards to Express
module.exports = (req, res) => {
  return app(req, res);
};
