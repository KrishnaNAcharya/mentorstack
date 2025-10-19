"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const generative_ai_1 = require("@google/generative-ai");
const router = (0, express_1.Router)();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const result = yield model.generateContent(prompt);
        const response = yield result.response;
        const text = response.text();
        // Try parsing JSON directly
        let tags = [];
        try {
            tags = JSON.parse(text);
        }
        catch (e) {
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
    }
    catch (err) {
        console.error("Error generating tags:", err);
        return res.status(500).json({ error: "Failed to generate tags" });
    }
}));
exports.default = router;
