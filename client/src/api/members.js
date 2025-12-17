export async function fetchMembers({ search = "", devOnly = false } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (devOnly) params.set("dev", "true");

  const url = `http://localhost:4000/api/members?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // { count, members }
}
