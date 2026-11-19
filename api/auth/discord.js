const crypto = require('crypto');
const { cookie } = require('../../lib/session');

module.exports = (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    response_type: 'code',
    scope: 'identify',
    state,
  });

  res.writeHead(302, {
    Location: `https://discord.com/oauth2/authorize?${params}`,
    'Set-Cookie': cookie('vx_state', state, 600),
  });
  res.end();
};
