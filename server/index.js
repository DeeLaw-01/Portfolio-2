import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import querystring from 'querystring'
import {
  sendContactEmail,
  sendContactConfirmation
} from './services/emailService.js'

dotenv.config()

const app = express()
app.use(express.json())
app.use(
  cors({
    credentials: true,
    origin: [
      'http://localhost:5173',
      'http://localhost:4000',
      'http://127.0.0.1:4000',
      'https://hackathonstartertemplate.onrender.com',
      'https://www.hackathonstartertemplate.onrender.com'
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

// Serve Spotify test page
app.get('/spotify-test', (_, res) => {
  res.sendFile('spotify-test.html', { root: '.' })
})

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

// Spotify Authentication Routes

// Generate random string for state parameter
const generateRandomString = length => {
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const values = crypto.getRandomValues(new Uint8Array(length))
  return values.reduce((acc, x) => acc + possible[x % possible.length], '')
}

// Spotify login route - returns auth URL
app.get('/api/spotify/login', (req, res) => {
  const client_id = process.env.SPOTIFY_CLIENT_ID
  const redirect_uri =
    process.env.SPOTIFY_REDIRECT_URI ||
    'http://localhost:4000/api/spotify/callback'

  if (!client_id) {
    return res.status(500).json({
      success: false,
      message: 'Spotify client ID not configured'
    })
  }

  const state = generateRandomString(16)
  const scope =
    'user-read-private user-read-email user-top-read user-read-currently-playing'

  // Store state in session or memory (in production, use Redis or database)
  req.session = req.session || {}
  req.session.spotifyState = state

  const authUrl =
    'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    })

  res.json({
    success: true,
    authUrl: authUrl
  })
})

// Direct Spotify auth route - redirects immediately
app.get('/api/spotify/auth', (req, res) => {
  const client_id = process.env.SPOTIFY_CLIENT_ID
  const redirect_uri =
    process.env.SPOTIFY_REDIRECT_URI ||
    'http://localhost:4000/api/spotify/callback'

  if (!client_id) {
    return res.status(500).send('Spotify client ID not configured')
  }

  const state = generateRandomString(16)
  const scope =
    'user-read-private user-read-email user-top-read user-read-currently-playing'

  const authUrl =
    'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    })

  res.redirect(authUrl)
})

// Spotify callback route
app.get('/api/spotify/callback', async (req, res) => {
  const { code, state, error } = req.query

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Spotify authorization failed',
      error: error
    })
  }

  if (!code) {
    return res.status(400).json({
      success: false,
      message: 'Authorization code not provided'
    })
  }

  try {
    const client_id = process.env.SPOTIFY_CLIENT_ID
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET
    const redirect_uri =
      process.env.SPOTIFY_REDIRECT_URI ||
      'http://localhost:4000/api/spotify/callback'

    if (!client_id || !client_secret) {
      return res.status(500).json({
        success: false,
        message: 'Spotify credentials not configured'
      })
    }

    // Exchange code for access token
    const tokenResponse = await fetch(
      'https://accounts.spotify.com/api/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization:
            'Basic ' +
            Buffer.from(client_id + ':' + client_secret).toString('base64')
        },
        body: querystring.stringify({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirect_uri
        })
      }
    )

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      return res.status(400).json({
        success: false,
        message: 'Failed to exchange code for token',
        error: tokenData
      })
    }

    // Redirect back to test page with token data
    const redirectUrl = `http://127.0.0.1:4000/spotify-test?access_token=${tokenData.access_token}&refresh_token=${tokenData.refresh_token}&expires_in=${tokenData.expires_in}&token_type=${tokenData.token_type}`
    res.redirect(redirectUrl)
  } catch (error) {
    console.error('Spotify callback error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error during Spotify authentication'
    })
  }
})

// Get Spotify tokens from environment variables
const spotifyAccessToken = process.env.SPOTIFY_ACCESS_TOKEN
const spotifyRefreshToken = process.env.SPOTIFY_REFRESH_TOKEN

// Route to get current Spotify track data
app.get('/api/spotify/current-track', async (req, res) => {
  if (!spotifyAccessToken) {
    return res.status(401).json({
      success: false,
      message: 'No Spotify token configured'
    })
  }

  try {
    // Try to get currently playing track first
    const currentlyPlayingResponse = await fetch(
      'https://api.spotify.com/v1/me/player/currently-playing',
      {
        headers: {
          Authorization: `Bearer ${spotifyAccessToken}`
        }
      }
    )

    if (currentlyPlayingResponse.ok) {
      // Check if response has content (204 means no content)
      if (currentlyPlayingResponse.status === 204) {
        console.log('No currently playing track')
      } else {
        try {
          const currentlyPlaying = await currentlyPlayingResponse.json()
          if (currentlyPlaying && currentlyPlaying.item) {
            return res.json({
              success: true,
              track: currentlyPlaying.item,
              isCurrentlyPlaying: true
            })
          }
        } catch (error) {
          console.log('Error parsing currently playing response:', error)
        }
      }
    }

    // Fallback to top track if no currently playing
    const topTracksResponse = await fetch(
      'https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=1',
      {
        headers: {
          Authorization: `Bearer ${spotifyAccessToken}`
        }
      }
    )

    if (topTracksResponse.ok) {
      try {
        const topTracks = await topTracksResponse.json()
        if (topTracks.items && topTracks.items.length > 0) {
          return res.json({
            success: true,
            track: topTracks.items[0],
            isCurrentlyPlaying: false
          })
        }
      } catch (error) {
        console.log('Error parsing top tracks response:', error)
      }
    } else {
      console.log(
        'Top tracks request failed:',
        topTracksResponse.status,
        topTracksResponse.statusText
      )
    }

    // No track data available
    res.json({
      success: true,
      track: null,
      message: 'No track data available'
    })
  } catch (error) {
    console.error('Error fetching Spotify data:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching Spotify data'
    })
  }
})

// Function to refresh Spotify token
async function refreshSpotifyToken () {
  if (!spotifyRefreshToken) {
    console.error('No refresh token available')
    return null
  }

  try {
    const client_id = process.env.SPOTIFY_CLIENT_ID
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET

    if (!client_id || !client_secret) {
      console.error('Spotify credentials not configured')
      return null
    }

    const tokenResponse = await fetch(
      'https://accounts.spotify.com/api/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization:
            'Basic ' +
            Buffer.from(client_id + ':' + client_secret).toString('base64')
        },
        body: querystring.stringify({
          grant_type: 'refresh_token',
          refresh_token: spotifyRefreshToken
        })
      }
    )

    const tokenData = await tokenResponse.json()

    if (tokenResponse.ok) {
      // Update the access token (you'd need to restart server or use a database)
      console.log('Token refreshed successfully')
      return tokenData.access_token
    } else {
      console.error('Failed to refresh token:', tokenData)
      return null
    }
  } catch (error) {
    console.error('Error refreshing token:', error)
    return null
  }
}

// Route to refresh Spotify token
app.post('/api/spotify/refresh', async (req, res) => {
  const { refresh_token } = req.body

  if (!refresh_token) {
    return res.status(400).json({
      success: false,
      message: 'Refresh token not provided'
    })
  }

  try {
    const client_id = process.env.SPOTIFY_CLIENT_ID
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET

    if (!client_id || !client_secret) {
      return res.status(500).json({
        success: false,
        message: 'Spotify credentials not configured'
      })
    }

    const tokenResponse = await fetch(
      'https://accounts.spotify.com/api/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization:
            'Basic ' +
            Buffer.from(client_id + ':' + client_secret).toString('base64')
        },
        body: querystring.stringify({
          grant_type: 'refresh_token',
          refresh_token: refresh_token
        })
      }
    )

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      return res.status(400).json({
        success: false,
        message: 'Failed to refresh token',
        error: tokenData
      })
    }

    res.json({
      success: true,
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type
    })
  } catch (error) {
    console.error('Spotify refresh error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error during token refresh'
    })
  }
})

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
