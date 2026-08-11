const express = require("express");
require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI WhatsApp Assistant is running");
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  try {
    const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message || message.type !== "text") {
      return res.sendStatus(200);
    }

    const userMessage = message.text.body;

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      input: [
        {
          role: "system",
          content:
            "You are a helpful WhatsApp AI assistant. Be friendly, concise, and helpful. You can communicate in English or Swahili depending on the user's language.",
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    console.log("User:", userMessage);
    console.log("AI:", response.output_text);

    // WhatsApp sending will be connected here after Meta Cloud API setup.
    return res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    return res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AI WhatsApp Assistant running on port ${PORT}`);
});
