// Simple token verification to match the custom token format from login
export function verifySimpleToken(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const [header, payload, signature] = parts;
    
    // Verify signature matches expected format (using Buffer for Node.js compatibility)
    const expectedSignature = Buffer.from(`${header}.${payload}.secret`).toString('base64');
    if (signature !== expectedSignature) {
      throw new Error('Invalid token signature');
    }

    // Decode payload (using Buffer for Node.js compatibility)
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
    
    // Check expiration
    if (decoded.exp && Date.now() > decoded.exp) {
      throw new Error('Token expired');
    }

    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}