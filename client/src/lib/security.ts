// Security utility functions for PassIntell Pro

// Sanitize user input to prevent XSS
export function sanitizeInput(input: string): string {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}

// Generate a secure token
export function generateSecureToken(): string {
  return crypto.randomUUID();
}

// Validate HIBP response
export function validateHIBPResponse(response: string): boolean {
  // Check that response only contains valid hex and counts
  const lines = response.split("\n");
  for (const line of lines) {
    if (!line.trim()) continue;
    const [suffix, countStr] = line.split(":");
    if (!/^[0-9A-Fa-f]{35}$/.test(suffix)) return false;
    if (!/^\d+$/.test(countStr)) return false;
  }
  return true;
}
