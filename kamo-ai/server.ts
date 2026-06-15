import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Shared API route for prompt generation
  app.post("/api/gemini/generate", async (req, res) => {
    try {
      const { prompt, systemInstruction, imageBase64, model = "gemini-1.5-flash" } = req.body;

      const contents = [];
      const parts = [];
      
      if (imageBase64) {
        parts.push({
          inlineData: {
            data: imageBase64.split(',')[1],
             mimeType: imageBase64.substring(imageBase64.indexOf(':') + 1, imageBase64.indexOf(';')),
          }
        });
      }
      
      if (prompt) {
        parts.push({ text: prompt });
      }

      contents.push({ parts });

      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          tools: [{
            functionDeclarations: [
              {
                name: "generateImage",
                description: "Generates an image based on a prompt and returns an image url. Call this function if the user explicitly asks you to generate, create, or draw a picture or image.",
                parameters: {
                  type: "OBJECT" as any,
                  properties: {
                    prompt: {
                      type: "STRING" as any,
                      description: "A highly detailed description of the image to generate.",
                    }
                  },
                  required: ["prompt"]
                }
              }
            ]
          }]
        },
      });

      const functionCalls = response.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        if (call.name === "generateImage") {
          const imagePrompt = (call.args as any).prompt;
          try {
            const imageRes = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: {
                parts: [{ text: imagePrompt }]
              },
              config: {
                imageConfig: {
                  aspectRatio: "1:1",
                }
              }
            });
            let imageUrl = null;
            for (const part of imageRes.candidates?.[0]?.content?.parts || []) {
              if (part.inlineData) {
                imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                break;
              }
            }
            if (imageUrl) {
              return res.json({ text: `Here is the image you requested:\n\n![${imagePrompt}](${imageUrl})` });
            }
          } catch (imgError: any) {
            console.error("Image generation failed:", imgError);
            return res.json({ text: `I tried to generate an image, but it failed: ${imgError.message}` });
          }
        }
      }

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      let errorMessage = error.message;
      if (errorMessage) {
        if (errorMessage.includes('503')) {
          errorMessage = "The AI model is currently experiencing high demand. Please try again in a few moments.";
        } else if (errorMessage.includes('429') || errorMessage.includes('quota')) {
          errorMessage = "The AI model's free quota limit has been exceeded. Please try again later.";
        }
      }
      res.status(500).json({ error: errorMessage });
    }
  });

  // Streaming chat API
  app.post("/api/gemini/chat-stream", async (req, res) => {
    try {
      const { history, message, model = "gemini-1.5-flash" } = req.body;
      
      const chat = ai.chats.create({
        model,
        config: {
          systemInstruction: "You are Kamo AI, a highly capable, helpful, and modern AI assistant created by Kamogelo Mokgata. Always provide fast, accurate, and concise responses.",
        },
      });

      // To handle history, we could map it to actual chat history format, but for simplicity, 
      // we'll pass the full context as string or use generateContentStream with parts.
      // We will just use generateContentStream with history rolled into the prompt for simplicity.
      let promptText = "";
      if (history && history.length > 0) {
        promptText += "Here is the conversation history:\n";
        history.forEach((msg: any) => {
          promptText += `${msg.role === "user" ? "User" : "AI"}: ${msg.content}\n`;
        });
        promptText += `\nNow reply to the user's latest message: ${message}\n`;
      } else {
        promptText = message;
      }

      const responseStream = await ai.models.generateContentStream({
        model,
        contents: promptText,
      });

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      for await (const chunk of responseStream) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
      res.end();
    } catch (error: any) {
      console.error("Stream error:", error);
      res.status(500).json({ error: error.message });
      res.end();
    }
  });

  // Image generation
  app.post("/api/gemini/generate-image", async (req, res) => {
    try {
      const { prompt } = req.body;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          }
        }
      });
      
      let imageUrl = null;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
      res.json({ imageUrl });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
