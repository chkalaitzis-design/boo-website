// Επιστρέφει υπογεγραμμένο link HLS του Bunny που λήγει σε 2 ώρες.
// Το κλειδί μένει κρυφό στο Vercel (Environment Variable BUNNY_TOKEN_KEY).
const crypto = require("crypto");

const CDN_HOST = "vz-86854b1a-c12.b-cdn.net";
const ID_RE = /^[0-9a-f-]{36}$/i;

module.exports = (req, res) => {
  const id = String(req.query.id || "");
  const key = process.env.BUNNY_TOKEN_KEY;
  if (!ID_RE.test(id)) return res.status(400).json({ error: "bad id" });
  if (!key) return res.status(500).json({ error: "missing key" });

  const expires = Math.floor(Date.now() / 1000) + 2 * 60 * 60;
  const tokenPath = `/${id}/`;
  const base = key + tokenPath + expires + "token_path=" + tokenPath;
  const token = crypto.createHash("sha256").update(base).digest("base64")
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  const url = `https://${CDN_HOST}/bcdn_token=${token}&expires=${expires}` +
    `&token_path=${encodeURIComponent(tokenPath)}${tokenPath}playlist.m3u8`;

  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ url, expires });
};
