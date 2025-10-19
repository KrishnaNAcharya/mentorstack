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
const gemini_1 = require("../lib/gemini");
const router = (0, express_1.Router)();
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { answers } = req.body;
        const model = gemini_1.genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
        const prompt = `Summarize these answers into concise explanation[100-150 words] highlighting key insights:\n\n${answers.join("\n\n")}
    and i just need the concise summary each explanation should be displayed one by one`;
        const result = yield model.generateContent(prompt);
        const summary = result.response.text();
        res.json({ summary });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to summarize" });
    }
}));
exports.default = router;
