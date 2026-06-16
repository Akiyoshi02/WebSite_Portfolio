export function formatAuthMessage(message: string) {
  const normalized = message.trim().replace(/\s+/g, " ");

  if (!normalized) {
    return "Something went wrong. Try again.";
  }

  const lowerMessage = normalized.toLowerCase();

  if (lowerMessage.includes("email rate limit exceeded")) {
    return "Email rate limit exceeded. Please wait a few minutes before sending another reset link.";
  }

  if (lowerMessage.includes("invalid login credentials")) {
    return "Invalid login credentials.";
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}
