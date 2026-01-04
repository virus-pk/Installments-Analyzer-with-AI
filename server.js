
import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("Set OPENAI_API_KEY in environment");
  process.exit(1);
}

app.use(express.static("public"));
app.use(bodyParser.json({ limit: "256kb" }));

function buildPrompt(userText) {
  return [
    { role: "system", content:
`You are a data analyst. Parse installment plan text and return JSON with:
analysis_md, table[{tenor_months, monthly_payment, total_paid, uplift_pct}], chart{labels[],datasets[]}.
Only output JSON.` },
    { role: "user", content: userText }
  ];
}

app.post("/analyze", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0,
        messages: buildPrompt(text)
      })
    });

    const j = await resp.json();
    const raw = j.choices?.[0]?.message?.content || "";
    let parsed;
    try { parsed = JSON.parse(raw); }
    catch {
      const a = raw.indexOf("{"), b = raw.lastIndexOf("}");
      parsed = JSON.parse(raw.slice(a,b+1));
    }
    res.json({ parsed });
  } catch(e) {
    res.status(500).json({ error: String(e) });
  }
});

app.listen(PORT, () => console.log("Running on", PORT));
