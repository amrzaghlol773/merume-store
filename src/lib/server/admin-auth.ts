export const ADMIN_SESSION_COOKIE = "merume_admin_session";

function requiredEnv(name: string, fallback: string) {
  const value = process.env[name]?.trim();
  return value || fallback;
}

export function getAdminUsername() {
  return requiredEnv("ADMIN_USERNAME", "admin");
}

export function getAdminPassword() {
  return requiredEnv("ADMIN_PASSWORD", "change-me");
}

export function getAdminSessionToken() {
  return requiredEnv("ADMIN_SESSION_TOKEN", "dev-admin-session-token");
}

export function isValidAdminCredentials(username: string, password: string) {
  return username === getAdminUsername() && password === getAdminPassword();
}
