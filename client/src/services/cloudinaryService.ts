const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

interface CloudinaryResponse {
  secure_url: string
  public_id: string
  width: number
  height: number
  format: string
  bytes: number
}

class CloudinaryService {
  async uploadImage (file: File): Promise<CloudinaryResponse> {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      throw new Error('Cloudinary configuration missing. Check your .env file.')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('folder', 'blog')

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    )

    if (!res.ok) {
      throw new Error('Failed to upload image to Cloudinary.')
    }

    return res.json()
  }

  // Generate optimized URL with transforms
  getOptimizedUrl (url: string, width?: number): string {
    if (!url || !url.includes('cloudinary')) return url
    // Insert transformation before /upload/
    const transform = width ? `w_${width},f_auto,q_auto` : 'f_auto,q_auto'
    return url.replace('/upload/', `/upload/${transform}/`)
  }
}

export const cloudinaryService = new CloudinaryService()
export type { CloudinaryResponse }
