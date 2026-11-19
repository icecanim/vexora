const { cookie, COOKIE } = require('../../lib/session');

module.exports = (req, res) => {
  res.writeHead(302, {
    Location: '/',
    'Set-Cookie': cookie(COOKIE, '', 0),
  });
  res.end();
};
