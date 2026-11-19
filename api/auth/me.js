const { getSession, isAdminId } = require('../../lib/session');

module.exports = (req, res) => {
  const s = getSession(req);
  if (!s || !isAdminId(s.id)) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.status(200).json({ id: s.id, name: s.name, avatar: s.avatar });
};
