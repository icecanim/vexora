const crypto = require('crypto');
const { getSession, isAdminId } = require('../lib/session');
const { readBin, writeBin } = require('../lib/jsonbin');

const txt = (v, max) => String(v ?? '').trim().slice(0, max);
const url = (v) => {
  const s = txt(v, 500);
  return /^(https?:\/\/|\/)/.test(s) ? s : '';
};

// Gelen veriyi temizler: sadece bilinen alanlar, uzunluk sınırları, güvenli URL'ler
function clean(body) {
  const s = body.settings || {};
  return {
    settings: {
      heroTitle: txt(s.heroTitle, 80),
      heroSubtitle: txt(s.heroSubtitle, 200),
      discordInvite: url(s.discordInvite),
    },
    products: (Array.isArray(body.products) ? body.products : [])
      .slice(0, 100)
      .filter((p) => p && txt(p.name, 80))
      .map((p) => ({
        id: txt(p.id, 60) || crypto.randomUUID(),
        name: txt(p.name, 80),
        price: txt(p.price, 30),
        description: txt(p.description, 600),
        image: url(p.image),
        buyUrl: url(p.buyUrl),
        badge: txt(p.badge, 20),
        featured: !!p.featured,
      })),
  };
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      return res.status(200).json(await readBin());
    }

    if (req.method === 'PUT') {
      const s = getSession(req);
      // Admin olmayanlara 404 dön
      if (!s || !isAdminId(s.id)) {
        return res.status(404).json({ error: 'Not found' });
      }
      const body =
        typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      await writeBin(clean(body));
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
};
