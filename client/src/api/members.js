export async function fetchMembers({ search = "", devOnly = false } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (devOnly) params.set("dev", "true");

  // Use Vite environment variable `VITE_API_BASE` for the deployed API base.
  // Set this in Netlify (or your host) to your backend URL, e.g. https://api.codykletter.me
  // Fallbacks: in production if not set use relative paths (''), in dev use localhost.
  const baseUrl = import.meta.env.VITE_API_BASE ?? (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:4000');

  const url = `${baseUrl}/api/members?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // { count, members }
}
