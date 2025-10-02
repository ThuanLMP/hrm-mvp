import bcrypt from "bcrypt";

// Simple token verification to match the custom token format from login
export function verifySimpleToken(token: string): any {
  try {
    // Token format: base64_payload.bcrypt_signature
    const parts = token.split(".");
    if (parts.length !== 2) {
      throw new Error("Invalid token format");
    }

    const [encodedPayload, signature] = parts;

    // Verify signature using bcrypt comparison
    const secret = process.env.JWT_SECRET || "hrm-mvp-secret-key";
    const expectedSignatureInput = `${encodedPayload}.${secret}`;

    // Use bcrypt to verify the signature
    const isValidSignature = bcrypt.compareSync(
      expectedSignatureInput,
      signature
    );
    if (!isValidSignature) {
      throw new Error("Invalid token signature");
    }

    // Decode payload from base64
    const decoded = JSON.parse(
      Buffer.from(encodedPayload, "base64").toString()
    );

    // Check expiration
    if (decoded.exp && Date.now() > decoded.exp) {
      throw new Error("Token expired");
    }

    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
}
