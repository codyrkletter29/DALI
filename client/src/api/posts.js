const BASE_URL =
  import.meta.env.VITE_API_BASE ??
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:4000");

export async function fetchPosts() {
  const response = await fetch(`${BASE_URL}/api/posts`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function createPost({ content, author }) {
  const response = await fetch(`${BASE_URL}/api/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content, author }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function togglePostLike(postId, memberId) {
  const response = await fetch(`${BASE_URL}/api/posts/${postId}/like`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ memberId }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  return response.json();
}
