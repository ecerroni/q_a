import BaseApiClass from "./_base";

export default class extends BaseApiClass {
  async getAnswer(question, opts = {}) {
    const apiKey = process.env.API_OPEN_AI_KEY;
    const response = await fetch(
      `${process.env.API_OPEN_AI_ENDPOINT}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.API_OPEN_AI_MODEL,
          messages: [
            {
              role: "system",
              content:
                "You are a concise assistant. When answering, provide only the final answer with no introduction or conclusion.",
            },
            { role: "user", content: question },
          ],
          ...opts,
        }),
      },
    );
    const data = await response.json();
    return data?.choices?.[0]?.message?.content?.trim?.() ?? "No answer";
  }
}
