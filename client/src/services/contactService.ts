interface ContactFormData {
  name: string
  email: string
  phone: string
  message: string
}

interface ContactResponse {
  success: boolean
  message: string
  confirmationSent?: boolean
}

class ContactService {
  private baseUrl: string

  constructor () {
    // Use environment variable or fallback to localhost
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
  }

  async sendContactForm (formData: ContactFormData): Promise<ContactResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send contact form')
      }

      return data
    } catch (error) {
      console.error('Contact service error:', error)

      // Return a user-friendly error response
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to send message. Please try again later.'
      }
    }
  }
}

export const contactService = new ContactService()
export type { ContactFormData, ContactResponse }
