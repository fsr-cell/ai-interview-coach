const https = require("https");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "未配置 ANTHROPIC_API_KEY" });
  }

  try {
    const body = JSON.stringify(req.body);
    const data = await new Promise((resolve, reject) => {
      const options = {
        hostname: "vip.aipro.love",
        path: "/v1/messages",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Length": Buffer.byteLength(body),
        },
      };
      const reqHttp = https.request(options, (r) => {
        let raw = "";
        r.on("data", chunk => { raw += chunk; });
        r.on("end", () => {
          try { resolve({ status: r.statusCode, body: JSON.parse(raw) }); }
          catch (e) { reject(e); }
        });
      });
      reqHttp.on("error", reject);
      reqHttp.write(body);
      reqHttp.end();
    });

    return res.status(data.status).json(data.body);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};