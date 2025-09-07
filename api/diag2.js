module.exports = async (req, res) => {
  try {
    let info = {};
    try { require('express'); info.express = 'ok'; } catch(e){ info.express = e.message; }
    try { require('mongoose'); info.mongoose = 'ok'; } catch(e){ info.mongoose = e.message; }
    try { require('../server/routes/auth'); info.authRoute = 'ok'; } catch(e){ info.authRoute = e.message; }
    try { require('../server/routes/about'); info.aboutRoute = 'ok'; } catch(e){ info.aboutRoute = e.message; }
    res.status(200).json({ ok: true, info });
  } catch (e) {
    res.status(500).json({ ok: false, error: e && e.message, stack: e && e.stack });
  }
};

