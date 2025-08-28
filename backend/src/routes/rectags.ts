import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

router.post("/", async (req: any, res: any) => {
    try {
        const { question, content } = req.body;

        if (!question && !content) {
            return res.status(400).json({ error: "Question or content is required" });
        }

        const prompt = `
    Based on the following question and content, recommend 5 relevant and valid tags.
    Return them as a JSON array of strings only.

    Question: ${question}
    Content: ${content}
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Try parsing JSON directly
        let tags: string[] = [];
        try {
            tags = JSON.parse(text);
        } catch (e) {
            // Fallback: extract tags manually (if model adds extra text)
            tags = text
                .replace(/```[a-z]*|```/gi, "") // remove code block markers
                .replace(/[\[\]"]/g, "")
                .replace(/\n/g, "")
                .split(",")
                .map((t) => t.replace(/^([\s\u200B]+)|([\s\u200B]+)$/g, "").trim())
                .filter((t) => t.length > 0);
        }

        return res.json({ tags });
    } catch (err) {
        console.error("Error generating tags:", err);
        return res.status(500).json({ error: "Failed to generate tags" });
    }
});

export default router;