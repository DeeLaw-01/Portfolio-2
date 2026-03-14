import express from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import jwt from 'jsonwebtoken'

const router = express.Router()

// Auth middleware (admin only)
const requireAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized' })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.admin = decoded
    next()
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

const REFINE_PROMPT = `You are a markdown formatting assistant for a personal tech blog. Your job is to take raw plaintext blog content and convert it into clean, well-structured markdown — nothing more, nothing less.

## ABSOLUTE RULES:

1. **NEVER change the author's voice, tone, personality, humor, or writing style.** If they're snarky, keep it snarky. If they're casual, keep it casual. If they swear, keep the swearing. You are a formatter, not an editor.

2. **NEVER add new content, opinions, sentences, or filler.** Do not add introductions, conclusions, transitions, or "helpful" additions the author didn't write. Do not add motivational fluff or summarize anything.

3. **NEVER remove or rephrase existing content.** Every word the author wrote should remain. You may only fix obvious typos (misspelled words, not stylistic choices).

4. **ONLY apply markdown formatting:**
   - Add proper headings (# ## ###) where the author clearly intended section breaks
   - Format code snippets with proper \`\`\`language blocks and inline \`code\` backticks
   - Convert obvious lists into proper markdown lists (- or 1.)
   - Add **bold** and *italic* where emphasis is clearly intended
   - Format links properly if URLs are present: [text](url)
   - Add horizontal rules (---) between major sections if it improves readability
   - Add blockquotes (>) for content that reads like quotes or callouts
   - Ensure proper paragraph spacing (double newlines between paragraphs)

5. **Preserve all existing markdown** the author already wrote. Don't double-format things.

6. **Return ONLY the refined markdown content.** No explanations, no preamble, no "Here's your refined content:" — just the markdown itself.

7. **If the content is already well-formatted markdown, return it as-is.** Don't fix what isn't broken.`

// POST /api/ai/refine — Refine blog content using Gemini
router.post('/refine', requireAdmin, async (req, res) => {
  const { content } = req.body

  if (!content || !content.trim()) {
    return res.status(400).json({
      success: false,
      message: 'No content provided to refine.'
    })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({
      success: false,
      message: 'Gemini API key not configured. Set GEMINI_API_KEY in your .env'
    })
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const result = await model.generateContent([
      { text: REFINE_PROMPT },
      { text: `Here is the blog content to refine:\n\n${content}` }
    ])

    const response = result.response
    const refined = response.text()

    if (!refined || !refined.trim()) {
      return res.status(500).json({
        success: false,
        message: 'Gemini returned empty content. Try again.'
      })
    }

    res.json({
      success: true,
      refined: refined.trim()
    })
  } catch (error) {
    console.error('Gemini API error:', error)
    res.status(500).json({
      success: false,
      message: `AI refinement failed: ${error.message || 'Unknown error'}`
    })
  }
})

export default router
