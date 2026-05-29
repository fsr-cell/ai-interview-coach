const https = require("https");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "未配置 GEMINI_API_KEY" });
  }

  try {
    const { messages, system, max_tokens } = req.body;

    // 转换消息格式：Anthropic → Gemini
    const contents = messages.map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: Array.isArray(m.content)
        ? m.content.map(c => {
            if (c.type === "text") return { text: c.text };
            if (c.type === "image") return { inlineData: { mimeType: c.source.media_type, data: c.source.data } };
            if (c.type === "document") return { inlineData: { mimeType: "application/pdf", data: c.source.data } };
            return { text: "" };
          })
        : [{ text: m.content }],
    }));

    const geminiBody = JSON.stringify({
      system_instruction: system ? { parts: [{ text: system }] } : undefined,
      contents,
      generationConfig: { maxOutputTokens: max_tokens || 2000 },
    });

    const data = await new Promise((resolve, reject) => {
      const options = {
        hostname: "generativelanguage.googleapis.com",
        path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(geminiBody),
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
      reqHttp.write(geminiBody);
      reqHttp.end();
    });

    if (data.status !== 200) {
      return res.status(data.status).json(data.body);
    }

    // 转换响应格式：Gemini → Anthropic（让前端代码不用改）
    const text = data.body.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
    return res.status(200).json({
      content: [{ type: "text", text }]
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};