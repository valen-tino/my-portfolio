module.exports = async (req, res) => {
  try {
    const app = require('./serverless');
    res.status(200).json({ ok: true, type: typeof app, keys: Object.keys(app || {}), defaultIsFunction: typeof (app && app.default) === 'function' });
  } catch (e) {
    res.status(500).json({ ok: false, error: e && e.message, stack: e && e.stack });
  }
};

