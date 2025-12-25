import { createContext, useState } from "react";

export const PostsContext = createContext();

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState([]);

  // Create a new post
  const createPost = (content, authorName) => {
    const newPost = {
      id: Date.now(), // Simple ID using timestamp
      content,
      authorName,
      createdAt: new Date(),
      likes: 0,
      likedBy: [], // Track which users liked it
    };

    setPosts([newPost, ...posts]); // Add to top
    return newPost;
  };

  // Toggle like on a post
  const toggleLike = (postId, userId) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const alreadyLiked = post.likedBy.includes(userId);
          return {
            ...post,
            likes: alreadyLiked ? post.likes - 1 : post.likes + 1,
            likedBy: alreadyLiked
              ? post.likedBy.filter((id) => id !== userId)
              : [...post.likedBy, userId],
          };
        }
        return post;
      })
    );
  };

  // Delete a post
  const deletePost = (postId) => {
    setPosts(posts.filter((post) => post.id !== postId));
  };

  return (
    <PostsContext.Provider value={{ posts, createPost, toggleLike, deletePost }}>
      {children}
    </PostsContext.Provider>
  );
}
