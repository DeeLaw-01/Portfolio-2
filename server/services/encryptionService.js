import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
const iv = crypto.randomBytes(16);

export const encryptMessage = (message) => {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(message, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    iv: iv.toString('hex'),
    content: encrypted,
  };
};

export const decryptMessage = (encryptedMessage) => {
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(encryptedMessage.iv, 'hex'));
  let decrypted = decipher.update(encryptedMessage.content, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};