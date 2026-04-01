import { saveUsage } from "./costService.js";
import { extractTextFromImage } from "./ocrService.js";

const safeParseJSON = (text) => {
  try {
    let cleaned = text.replace(/```json|```/g, "").trim();

    cleaned = cleaned
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/\n/g, " ");

    const match = cleaned.match(/\{[\s\S]*\}/);

    if (match) return JSON.parse(match[0]);

    return null;
  } catch {
    return null;
  }
};

export const extractTableFromImage = async (base64Image, userId, retry = 0) => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        max_tokens: 150,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Return STRICT JSON only (no text outside). Extract meta + rows.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    console.log("RAW AI RESPONSE 👉", data);

    // ✅ handle API error
    if (data.error) {
      console.log("AI ERROR:", data.error.message);
      return { meta: {}, rows: [] };
    }

    // ✅ save cost
    await saveUsage(data, userId || "guest");

    if (!data.choices?.length) {
      return { meta: {}, rows: [] };
    }

    const text = data.choices[0].message.content;

    if (!text) {
        console.log("❌ Empty AI response");
        return { meta: {}, rows: [] };
    }

    if (text.length < 50 && retry < 1) {
        console.log("⚠️ Weak response, retrying once...");
        return await extractTableFromImage(base64Image, userId, retry + 1);
    }

    if (text.length < 50){
        console.log("❌ Still weak after retry");
        return { meta: {}, rows: [] };
    }

    const parsed = safeParseJSON(text);

    if (parsed) return parsed;

    if (!parsed || parsed.rows.length === 0){
        console.log("⚠️ AI failed, using OCR fallback");

        const ocrText = await extractTextFromImage(base64Image);

        return { meta: {}, rows: [{text: ocrText}] };
    }


  } catch (err) {
    console.log("Vision AI Error:", err.message);
    return { meta: {}, rows: [] };
  }
};