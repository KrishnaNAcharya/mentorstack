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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = express_1.default.Router();
function isAxiosError(error) {
    return error.isAxiosError !== undefined;
}
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: "Text is required" });
    }
    try {
        const prompt = `Please rephrase the following text in a clear and concise way, maintaining its original meaning: "${text}"
        and while responding just return the rephrased text.`;
        const response = yield axios_1.default.post(
        // Changed the model name to gemini-2.5-flash-lite
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            contents: [{ parts: [{ text: prompt }] }],
        }, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        const rephrasedText = ((_f = (_e = (_d = (_c = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.candidates) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.content) === null || _d === void 0 ? void 0 : _d.parts) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.text) ||
            "No rephrased text available.";
        res.json({ rephrasedText });
    }
    catch (error) {
        if (isAxiosError(error)) {
            console.error("Error calling Gemini API:", ((_g = error.response) === null || _g === void 0 ? void 0 : _g.data) || error.message);
            return res.status(500).json({ error: "Failed to rephrase text" });
        }
        else {
            console.error("An unexpected error occurred:", error);
            return res.status(500).json({ error: "An unexpected error occurred" });
        }
    }
}));
exports.default = router;
