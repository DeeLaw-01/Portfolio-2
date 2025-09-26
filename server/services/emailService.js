import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

transporter.verify(function (error, success) {
  if (error) {
    console.log('Transporter verification failed:', error)
  } else {
    console.log('Server is ready to take our messages')
  }
})

export const sendVerificationEmail = async (email, token) => {
  const mailOptions = {
    from: `"Company ABC" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Email Verification',
    html: `
      <div>
        <h1>Email Verification</h1>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${process.env.FRONTEND_URL}/verify-email?token=${token}">Verify Email</a>
      </div>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Email sending failed:', error)
    return false
  }
}

export const sendNotificationEmail = async (email, message) => {
  const mailOptions = {
    from: `"Company ABC" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'New Notification',
    html: `<p>${message}</p>`
  }

  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Email sending failed:', error)
    return false
  }
}
export const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: `"Company ABC" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Email Verification</h1>
        <p>Your OTP for email verification is:</p>
        <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
          <strong>${otp}</strong>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p style="color: #666; font-size: 12px;">If you didn't request this OTP, please ignore this email.</p>
      </div>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Email sending failed:', error)
    return false
  }
}

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send contact form email to Waleed
export const sendContactEmail = async contactData => {
  const { name, email, phone, message } = contactData

  const mailOptions = {
    from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // Your email
    subject: `New Contact Form Submission from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #7203a9; border-bottom: 2px solid #7203a9; padding-bottom: 10px;">
          New Portfolio Contact Form Submission
        </h2>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Contact Details:</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        </div>
        
        <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #333;">Message:</h3>
          <p style="line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #e8f4fd; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            This email was sent from your portfolio contact form. 
            You can reply directly to <a href="mailto:${email}">${email}</a>
          </p>
        </div>
      </div>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Contact email sending failed:', error)
    return false
  }
}

// Send confirmation email to the person who contacted you
export const sendContactConfirmation = async contactData => {
  const { name, email } = contactData

  const mailOptions = {
    from: `"Waleed Ahmed" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Thank you for contacting me!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #7203a9; border-bottom: 2px solid #7203a9; padding-bottom: 10px;">
          Thank You for Getting in Touch!
        </h2>
        
        <p>Hi ${name},</p>
        
        <p>Thank you for reaching out through my portfolio! I've received your message and I'm excited to connect with you.</p>
        
        <div style="background-color: #f0f8ff; padding: 20px; border-left: 4px solid #7203a9; margin: 20px 0;">
          <p style="margin: 0;"><strong>What happens next?</strong></p>
          <ul style="margin: 10px 0 0 20px;">
            <li>I'll review your message carefully</li>
            <li>You can expect a response within 24-48 hours</li>
            <li>I'll reach out to discuss your project or opportunity</li>
          </ul>
        </div>
        
        <p>In the meantime, feel free to:</p>
        <ul>
          <li>Check out my other projects on <a href="https://github.com/waleedahmed" style="color: #7203a9;">GitHub</a></li>
          <li>Connect with me on <a href="https://linkedin.com/in/waleedahmed" style="color: #7203a9;">LinkedIn</a></li>
          <li>Explore more of my work on my portfolio</li>
        </ul>
        
        <p>Looking forward to our conversation!</p>
        
        <p style="margin-top: 30px;">
          Best regards,<br>
          <strong>Waleed Ahmed</strong><br>
          <span style="color: #666;">Full Stack Developer</span>
        </p>
        
        <div style="margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-radius: 8px; font-size: 12px; color: #666;">
          <p style="margin: 0;">
            This is an automated confirmation email. Please don't reply to this email. 
            I'll contact you directly from my personal email address.
          </p>
        </div>
      </div>
    `
  }

  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Contact confirmation email sending failed:', error)
    return false
  }
}
