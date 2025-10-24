import { Router } from "express";
import { generateWithGemini } from "../lib/gemini";

const router = Router();

router.post("/", async (req: any, res: any) => {
  try {
    const { text } = (req.body as { text?: string }) || {};
    
    if (!text || text.trim().length === 0) {
      return res.json({ suggestions: [] });
    }

    // Improved prompt - check EACH word individually
    const prompt = `You are a professional spelling checker. Check EACH WORD SEPARATELY for spelling errors AND capitalization.

CRITICAL RULES:
1. Check ONLY ONE WORD at a time - never group multiple words together
2. Return ONLY the EXACT misspelled word (not its neighbors)
3. The "offset" is the character position (0-based) where the misspelled word starts
4. The "length" is ONLY the length of the misspelled word (no spaces)
5. Check for BOTH spelling errors AND capitalization errors (e.g., "i" should be "I")
6. Do NOT flag: proper nouns, technical terms, code keywords, abbreviations, correctly spelled words
7. Do NOT flag grammar errors - ONLY spelling and capitalization
8. NEVER suggest the same word as a correction - if a word is correct, don't flag it!
9. Suggestions must be DIFFERENT from the original word (different spelling or capitalization)

Return ONLY valid JSON (no markdown, no explanations):
[
  {
    "word": "the single misspelled word",
    "offset": position where this word starts,
    "length": length of this word only,
    "message": "Spelling error" or "Capitalization error",
    "suggestions": ["correction1", "correction2", "correction3"]
  }
]

EXAMPLES:

Text: "i hate myself issue for not being"
CORRECT: [{"word":"i","offset":0,"length":1,"message":"Capitalization error","suggestions":["I"]}]  ✅ Lowercase "i" should be "I"
WRONG: [{"word":"hate","suggestions":["heat"]}]  ❌ "hate" is correctly spelled, don't flag it!

Text: "it was a short decripion"
WRONG: [{"word":"short decripion",...}]  ❌ Never group words!
CORRECT: [{"word":"decripion","offset":15,"length":9,"message":"Spelling error","suggestions":["description"]}]  ✅ Only the typo

Text: "The quik brown foxs"
CORRECT: [{"word":"quik","offset":4,"length":4,"message":"Spelling error","suggestions":["quick"]},{"word":"foxs","offset":15,"length":4,"message":"Spelling error","suggestions":["fox","foxes"]}]  ✅ Each word separately

Text: "The issue was clear"
WRONG: [{"word":"issue","suggestions":["issue"]}]  ❌ Never suggest the same word!
CORRECT: []  ✅ No errors if all words are correct

Return empty array [] if no errors.

Text to check:
"""
${text}
"""

JSON array:`;

    const responseText = await generateWithGemini(prompt);

    // Clean the response - remove markdown code blocks if present
    let cleanedResponse = responseText.trim();
    
    // Remove markdown code blocks (using split/join for older TS targets)
    cleanedResponse = cleanedResponse.split(/```json\s*/g).join('').split(/```\s*/g).join('');
    
    // Extract JSON array
    const jsonMatch = /\[[\s\S]*\]/.exec(cleanedResponse);
    
    if (!jsonMatch) {
      console.log("No JSON array found in response:", responseText);
      return res.json({ suggestions: [] });
    }

    try {
      const suggestions = JSON.parse(jsonMatch[0]);
      
      // Validate the structure
      const validSuggestions = Array.isArray(suggestions) 
        ? suggestions.filter(s => 
            typeof s.word === 'string' &&
            typeof s.offset === 'number' &&
            typeof s.length === 'number' &&
            Array.isArray(s.suggestions)
          )
        : [];

      return res.json({ suggestions: validSuggestions });
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return res.json({ suggestions: [] });
    }

  } catch (error) {
    console.error("Spellcheck error:", error);
    return res.status(500).json({ 
      suggestions: [],
      error: "Spellcheck service temporarily unavailable" 
    });
  }
});

export default router;
