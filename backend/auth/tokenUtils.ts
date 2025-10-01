// Simple token verification to match the custom token format from login
export function verifySimpleToken(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid token format");
    }

    const [header, payload, signature] = parts;

    // Verify signature matches expected format
    const expectedSignature = `${header}.${payload}.secret`;
    if (signature !== expectedSignature) {
      throw new Error("Invalid token signature");
    }

    // Decode payload
    const decoded = JSON.parse(payload);

    // Check expiration
    if (decoded.exp && Date.now() > decoded.exp) {
      throw new Error("Token expired");
    }

    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
}
