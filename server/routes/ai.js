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

const CONTENT_PROMPT = `You are a blog post writer and formatter for a personal tech blog. The author writes casually — snarky, opinionated, "holier than thou" energy. Your job is to take their raw, messy plaintext and turn it into a polished, well-structured blog post in markdown.

## WHAT YOU MUST DO:

1. **Structure the content properly.** Add clear headings (# ## ###) to break up sections. Use proper heading hierarchy — H1 for the main topic, H2 for sections, H3 for sub-sections.

2. **Rewrite for clarity and flow.** Clean up grammar, punctuation, and sentence structure. Make it read like a proper blog post — smooth transitions, clear paragraphs, good pacing. Break up walls of text.

3. **Keep the author's voice and personality intact.** If they're being snarky, keep it snarky. If they're roasting something, keep the roast. If they swear, keep the swearing. Match their energy — don't sanitize it or make it corporate.

4. **Apply full markdown formatting:**
   - Headings with proper hierarchy (# ## ###)
   - Code blocks with language tags (\`\`\`javascript, \`\`\`python, etc.) and inline \`code\` for technical terms
   - Bullet lists (- item) and numbered lists (1. item) where appropriate
   - **Bold** for emphasis, *italic* for softer emphasis
   - Proper [links](url) if URLs are present
   - Blockquotes (>) for callouts or notable points
   - Horizontal rules (---) between major sections
   - Tables where data would benefit from tabular format
   - Proper paragraph spacing

5. **Expand slightly where needed.** If a point feels incomplete or could use a connecting sentence for flow, add it — but stay true to what the author was saying. Don't add fluff, motivational garbage, or generic filler.

6. **Fix all typos and grammatical errors.** Don't ask, just fix them.

7. **Return ONLY the refined markdown.** No preamble, no "Here's your refined version:", no explanations — just the markdown content itself.`

const TITLE_PROMPT = `You are a blog title refiner. Given a rough blog title, make it punchy, clear, and engaging. Keep the author's tone (snarky/casual tech blogger vibe). Return ONLY the refined title text — no quotes, no markdown, no explanation. Just the title.`

const EXCERPT_PROMPT = `You are a blog excerpt writer. Given a rough description/excerpt, rewrite it to be a compelling 1-2 sentence summary that makes people want to read the post. Keep the author's snarky, casual tone. Max 200 characters. Return ONLY the refined excerpt text — no quotes, no markdown, no explanation.`

// POST /api/ai/refine — Refine blog content, title, and excerpt using Gemini
router.post('/refine', requireAdmin, async (req, res) => {
  const { title, excerpt, content } = req.body

  if (!content?.trim() && !title?.trim() && !excerpt?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Nothing to refine. Write something first.'
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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

    const results = {}

    // Refine all provided fields in parallel
    const tasks = []

    if (content?.trim()) {
      tasks.push(
        model
          .generateContent([
            { text: CONTENT_PROMPT },
            { text: `Here is the raw blog content:\n\n${content}` }
          ])
          .then(r => {
            results.content = r.response.text()?.trim() || null
          })
      )
    }

    if (title?.trim()) {
      tasks.push(
        model
          .generateContent([
            { text: TITLE_PROMPT },
            { text: `Raw title: ${title}` }
          ])
          .then(r => {
            results.title = r.response.text()?.trim() || null
          })
      )
    }

    if (excerpt?.trim()) {
      tasks.push(
        model
          .generateContent([
            { text: EXCERPT_PROMPT },
            { text: `Raw excerpt: ${excerpt}` }
          ])
          .then(r => {
            results.excerpt = r.response.text()?.trim() || null
          })
      )
    }

    await Promise.all(tasks)

    res.json({
      success: true,
      refined: {
        title: results.title || null,
        excerpt: results.excerpt || null,
        content: results.content || null
      }
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
