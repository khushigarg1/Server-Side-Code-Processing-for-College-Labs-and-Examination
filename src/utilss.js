// Function to encode a string to base64
export function encodeToBase64(str) {
  return Buffer.from(str).toString('base64');
}

// Function to decode a base64 string to a normal string
export function decodeFromBase64(str) {
  return Buffer.from(str, 'base64').toString();
}