const BASE = "http://localhost:5000/api";

export async function api(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      // only add the token if we have one
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 204) return null; // DELETE returns no body

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error || "Something went wrong");
    err.status = res.status; // lets the app react to a 401
    throw err;
  }
  return data;
}