export async function fetchMembers({ search = "", devOnly = false } = {}) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (devOnly) params.set("dev", "true");

  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://api.codykletter.me'  // Replace with your actual API domain when deployed
    : 'http://localhost:4000';
  
  const url = `${baseUrl}/api/members?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // { count, members }
}
