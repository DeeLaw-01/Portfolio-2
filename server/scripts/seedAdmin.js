import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Admin from '../models/Admin.js'

dotenv.config()

// Credentials come from env vars, with CLI overrides: node scripts/seedAdmin.js <email> <password> <name>
const [, , cliEmail, cliPassword, cliName] = process.argv

const email = cliEmail || process.env.ADMIN_EMAIL
const password = cliPassword || process.env.ADMIN_PASSWORD
const name = cliName || process.env.ADMIN_NAME || 'Admin'

async function seedAdmin () {
  if (!process.env.MONGO_URI) {
    console.error('Missing MONGO_URI. Set it in server/.env before seeding.')
    process.exit(1)
  }

  if (!email || !password) {
    console.error(
      'Missing admin credentials. Provide ADMIN_EMAIL and ADMIN_PASSWORD in server/.env,\n' +
        'or pass them as arguments: node scripts/seedAdmin.js <email> <password> [name]'
    )
    process.exit(1)
  }

  mongoose.set('strictQuery', false)
  await mongoose.connect(process.env.MONGO_URI)
  console.log('MongoDB connected')

  try {
    const existing = await Admin.findOne({ email: email.toLowerCase() })
    if (existing) {
      console.log(`Admin "${email}" already exists. Skipping seed.`)
      return
    }

    // Pass plaintext password: the Admin pre('save') hook hashes it with bcrypt.
    await new Admin({ email, password, name }).save()
    console.log(`Admin "${email}" seeded successfully.`)
  } finally {
    await mongoose.disconnect()
    console.log('MongoDB disconnected')
  }
}

seedAdmin().catch(err => {
  console.error('Failed to seed admin:', err)
  process.exit(1)
})
