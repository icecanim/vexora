const fs = require('fs');
const path = require('path');
const { getSession, isAdminId } = require('../lib/session');

module.exports = (req, res) => {
  let isAdmin = false;
  try {
    const s = getSession(req);
    isAdmin = !!s && isAdminId(s.id);
  } catch (e) {
    console.error(e);
  }

  // Admin değilse 404 sayfasını 404 durum koduyla dön
  const file = isAdmin
    ? path.join(__dirname, '..', 'admin', 'panel.html')
    : path.join(__dirname, '..', 'public', '404.html');

  res.statusCode = isAdmin ? 200 : 404;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(fs.readFileSync(file));
};
