export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getRole(): "admin" | "user" | null {
  if (typeof window === "undefined") return null;

  const role = localStorage.getItem("role");

  if (role === "admin" || role === "user") return role;

  return null;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
}
