const crypto = require("crypto");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const appid     = process.env.XF_APPID;
  const apiKey    = process.env.XF_API_KEY;
  const apiSecret = process.env.XF_API_SECRET;

  if (!appid || !apiKey || !apiSecret) {
    return res.status(500).json({ error: "讯飞配置缺失" });
  }

  const host = "cbm01.cn-huabei-1.xf-yun.com";
  const path = "/v1/private/mcd9m97e6";
  const date = new Date().toUTCString();

  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
  const signature = crypto.createHmac("sha256", apiSecret).update(signatureOrigin).digest("base64");
  const authorizationOrigin = `api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
  const authorization = Buffer.from(authorizationOrigin).toString("base64");

  const url = `wss://${host}${path}?authorization=${encodeURIComponent(authorization)}&date=${encodeURIComponent(date)}&host=${encodeURIComponent(host)}`;

  return res.status(200).json({ url, appid });
};
