const API = 'https://api.jsonbin.io/v3/b';

function config() {
  const key = process.env.JSONBIN_MASTER_KEY;
  const id = process.env.JSONBIN_BIN_ID;
  if (!key || !id) throw new Error('JSONBIN_MASTER_KEY veya JSONBIN_BIN_ID eksik');
  return { key, id };
}

async function readBin() {
  const { key, id } = config();
  const r = await fetch(`${API}/${id}/latest`, {
    headers: { 'X-Master-Key': key },
  });
  if (!r.ok) throw new Error(`JsonBin okuma hatası: ${r.status}`);
  const { record } = await r.json();
  return {
    settings: record?.settings || {},
    products: record?.products || [],
  };
}

async function writeBin(data) {
  const { key, id } = config();
  const r = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': key,
      'X-Bin-Versioning': 'false',
    },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(`JsonBin yazma hatası: ${r.status}`);
}

module.exports = { readBin, writeBin };
