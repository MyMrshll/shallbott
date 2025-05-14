const Groq = require("groq-sdk");
const { config } = require("dotenv");
config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
async function main(promptUser = "") {
  const chatCompletion = await getGroqChatCompletion(promptUser);
  // Print the completion returned by the LLM.
  return chatCompletion.choices[0]?.message?.content || "";
}
async function getGroqChatCompletion(promptUser) {
  const messages = [
  {
      role: "system",
      content:
        "Kamu adalah asisten AI yang cerdas dan sopan. Jawablah pertanyaan atau permintaan pengguna dengan jelas, ringkas, dan informatif.",
    },
    {
      role: "user",
      content: promptUser,
    }
  ];

  return groq.chat.completions.create({
    messages,
    model: "llama-3.3-70b-versatile",
  });
}

module.exports = { main };
