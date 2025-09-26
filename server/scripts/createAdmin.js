import mongoose from 'mongoose'
import User from '../models/User.js'
import dotenv from 'dotenv'

dotenv.config()

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connected to MongoDB')

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' })
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email)
      process.exit(0)
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@hackstarter.com', // Change this to your desired admin email
      password: 'admin123', // Change this to a secure password
      role: 'admin',
      isVerified: true
    })

    await adminUser.save()
    console.log('Admin user created successfully!')
    console.log('Email:', adminUser.email)
    console.log('Password: admin123') // Remember to change this
    console.log('Please change the password after first login')
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    mongoose.connection.close()
  }
}

createAdmin()
