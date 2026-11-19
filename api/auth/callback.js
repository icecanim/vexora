const {
  parseCookies,
  sign,
  cookie,
  isAdminId,
  COOKIE,
  MAX_AGE,
} = require('../../lib/session');

const redirect = (res, location, cookies = []) => {
  res.writeHead(302, { Location: location, 'Set-Cookie': cookies });
  res.end();
};

module.exports = async (req, res) => {
  const url = new URL(req.url, 'https://localhost');
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const saved = parseCookies(req).vx_state;
  const clearState = cookie('vx_state', '', 0);

  // CSRF kontrolü
  if (!code || !state || !saved || state !== saved) {
    return redirect(res, '/yonetim', [clearState]);
  }

  try {
    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
      }),
    });
    if (!tokenRes.ok) throw new Error(`token ${tokenRes.status}`);
    const { access_token } = await tokenRes.json();

    const userRes = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const user = await userRes.json();

    // ID listede değilse oturum açılmaz, /yonetim 404 gösterir
    if (!isAdminId(user.id)) {
      return redirect(res, '/yonetim', [clearState]);
    }

    const token = sign({
      id: user.id,
      name: user.global_name || user.username,
      avatar: user.avatar,
      exp: Math.floor(Date.now() / 1000) + MAX_AGE,
    });

    return redirect(res, '/yonetim', [
      cookie(COOKIE, token, MAX_AGE),
      clearState,
    ]);
  } catch (e) {
    console.error(e);
    return redirect(res, '/yonetim', [clearState]);
  }
};
