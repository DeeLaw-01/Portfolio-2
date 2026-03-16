import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import {
  sendContactEmail,
  sendContactConfirmation
} from './services/emailService.js'
import authRoutes from './routes/auth.js'
import blogRoutes from './routes/blogs.js'
import tagRoutes from './routes/tags.js'
import commentRoutes from './routes/comments.js'
import aiRoutes from './routes/ai.js'

dotenv.config()

const app = express()
app.use(express.json())
app.use(
  cors({
    credentials: true,
    origin: [
      'http://localhost:5173',
      'https://waleed-ahmed-xep2.onrender.com',
      'https://www.waleed-ahmed-xep2.onrender.com',
      'https://iamwaleed.me',
      'https://www.iamwaleed.me'
    ]
  })
)

mongoose.set('strictQuery', false)
mongoose.connect(process.env.MONGO_URI)

const db = mongoose.connection

db.once('open', () => {
  console.log('MongoDB connected')
})

db.on('error', error => {
  console.log(error)
})

db.on('disconnected', () => {
  console.log('MongoDB disconnected')
})

// ROUTES

app.get('/', (_, res) => {
  res.send('Server is running!')
})

// Blog & Auth routes
app.use('/api/auth', authRoutes)
app.use('/api/blogs', blogRoutes)
app.use('/api/tags', tagRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/ai', aiRoutes)

// Contact form route
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required fields'
      })
    }

    // Send email to you (Waleed)
    const emailSent = await sendContactEmail({ name, email, phone, message })

    // Send confirmation email to the contact person
    const confirmationSent = await sendContactConfirmation({ name, email })

    if (emailSent) {
      res.status(200).json({
        success: true,
        message: 'Contact form submitted successfully!',
        confirmationSent
      })
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send email. Please try again later.'
      })
    }
  } catch (error) {
    console.error('Contact form error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.'
    })
  }
})

// Twitter syndication proxy (bypasses regional blocks on cdn.syndication.twimg.com)
app.get('/api/twitter/tweet/:id', async (req, res) => {
  const { id } = req.params

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid tweet ID' })
  }

  try {
    // Same logic react-tweet uses internally
    const token = (Number(id) / 1e15 * Math.PI).toString(36).replace(/(0+|\.)/g, '')
    const syndicationUrl = new URL('https://cdn.syndication.twimg.com/tweet-result')
    syndicationUrl.searchParams.set('id', id)
    syndicationUrl.searchParams.set('lang', 'en')
    syndicationUrl.searchParams.set('features', [
      'tfw_timeline_list:',
      'tfw_follower_count_sunset:true',
      'tfw_tweet_edit_backend:on',
      'tfw_refsrc_session:on',
      'tfw_fosnr_soft_interventions_enabled:on',
      'tfw_show_birdwatch_pivots_enabled:on',
      'tfw_show_business_verified_badge:on',
      'tfw_duplicate_scribes_to_settings:on',
      'tfw_use_profile_image_shape_enabled:on',
      'tfw_show_blue_verified_badge:on',
      'tfw_legacy_timeline_sunset:true',
      'tfw_show_gov_verified_badge:on',
      'tfw_show_business_affiliate_badge:on',
      'tfw_tweet_edit_frontend:on'
    ].join(';'))
    syndicationUrl.searchParams.set('token', token)

    const response = await fetch(syndicationUrl.toString())

    if (!response.ok) {
      return res.status(response.status).json({ error: `Twitter API returned ${response.status}` })
    }

    const data = await response.json()
    // react-tweet expects { data: ... } wrapper
    res.json({ data })
  } catch (error) {
    console.error('Twitter proxy error:', error)
    res.status(500).json({ error: 'Failed to fetch tweet' })
  }
})

// GitHub API Routes

// GET /api/github/recent-activity - Get recent GitHub commits (including private repos)
app.get('/api/github/recent-activity', async (req, res) => {
  const githubUsername = process.env.GITHUB_USERNAME
  const githubToken = process.env.GITHUB_TOKEN // Required for private repos

  if (!githubUsername) {
    return res.status(400).json({
      success: false,
      message: 'GitHub username not configured'
    })
  }

  if (!githubToken) {
    return res.status(400).json({
      success: false,
      message:
        'GitHub token required for private repo access. Set GITHUB_TOKEN in your .env'
    })
  }

  try {
    const headers = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Portfolio-App',
      Authorization: `token ${githubToken}`
    }

    // Get user's repositories (including private ones with token)
    const reposResponse = await fetch(
      `https://api.github.com/user/repos?sort=updated&per_page=10&affiliation=owner`,
      { headers }
    )

    if (!reposResponse.ok) {
      if (reposResponse.status === 401) {
        return res.status(401).json({
        success: false,
          message: 'GitHub token invalid or expired'
        })
      }
      throw new Error(`GitHub API error: ${reposResponse.status}`)
    }

    const repos = await reposResponse.json()
    const commits = []

    // Fetch recent commits from each repo (up to 5 repos)
    for (const repo of repos.slice(0, 5)) {
      try {
        const commitsResponse = await fetch(
          `https://api.github.com/repos/${repo.full_name}/commits?per_page=3&author=${githubUsername}`,
          { headers }
        )

        if (commitsResponse.ok) {
          const repoCommits = await commitsResponse.json()
          for (const commit of repoCommits) {
            commits.push({
              sha: commit.sha,
              commit: {
                message: commit.commit.message,
                author: {
                  name: commit.commit.author.name,
                  date: commit.commit.author.date
                }
              },
              html_url: commit.html_url,
              repository: {
                name: repo.name,
                full_name: repo.full_name
              }
            })

            // Limit to 5 most recent commits total
            if (commits.length >= 5) break
          }
        }
        if (commits.length >= 5) break
      } catch (error) {
        // Skip repos that fail (might be private without access)
        console.log(`Skipping repo ${repo.full_name}:`, error.message)
        continue
      }
    }

    // Sort by date (most recent first) and limit to 5
    commits.sort((a, b) => {
      return (
        new Date(b.commit.author.date).getTime() -
        new Date(a.commit.author.date).getTime()
      )
    })

    res.json({
      success: true,
      username: githubUsername,
      commits: commits.slice(0, 5)
    })
  } catch (error) {
    console.error('Error fetching GitHub activity:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch GitHub activity',
      commits: []
    })
  }
})

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
