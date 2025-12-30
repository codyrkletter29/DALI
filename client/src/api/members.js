const BASE_URL =
  import.meta.env.VITE_API_BASE ??
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:4000");

export async function fetchMember(id) {
  const response = await fetch(`${BASE_URL}/api/members/${id}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function fetchMembers({ search = "", role = "" } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (role) params.set("role", role);
  const query = params.toString();
  const response = await fetch(
    `${BASE_URL}/api/members${query ? `?${query}` : ""}`
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function fetchSimilarMembers(memberId, limit = 10) {
  const params = new URLSearchParams();
  if (limit) params.set("limit", limit.toString());
  const query = params.toString();
  const response = await fetch(
    `${BASE_URL}/api/members/${memberId}/similar${query ? `?${query}` : ""}`
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
