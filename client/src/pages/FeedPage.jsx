import { useEffect, useMemo, useState } from "react";
import {
  createPost,
  fetchPosts,
  togglePostLike,
} from "../api/posts";
import "../styles/FeedPage.css";

const formatTimestamp = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function FeedPage() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("Loading posts...");
  const [error, setError] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingLikes, setPendingLikes] = useState([]);

  const currentUser = useMemo(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      return null;
    }
  }, []);

  const currentMember = currentUser?.member ?? null;

  useEffect(() => {
    let isMounted = true;
    setStatus("Loading posts...");
    setError("");

    fetchPosts()
      .then((data) => {
        if (!isMounted) return;
        setPosts(data.posts || []);
        setStatus(data.posts?.length ? "" : "Be the first to post something! ✨");
      })
      .catch(() => {
        if (!isMounted) return;
        setStatus("");
        setError("Failed to load posts.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!currentMember?.id) {
      setError("Log in to create a post.");
      return;
    }

    if (!content.trim()) {
      setError("Write something before posting.");
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await createPost({
        content,
        author: currentMember.id,
      });
      setPosts((prev) => [data.post, ...prev]);
      setContent("");
      setStatus("Post shared!");
    } catch (err) {
      setError("Failed to create post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId) => {
    if (!currentMember?.id) {
      setError("Log in to like posts.");
      return;
    }

    if (pendingLikes.includes(postId)) return;
    setError("");
    setPendingLikes((prev) => [...new Set([...prev, postId])]);
    try {
      const data = await togglePostLike(postId, currentMember.id);
      setPosts((prev) =>
        prev.map((post) => (post._id === data.post._id ? data.post : post))
      );
    } catch (err) {
      setError("Failed to update like.");
    } finally {
      setPendingLikes((prev) => prev.filter((id) => id !== postId));
    }
  };

  return (
    <div className="feedPage">
      <div className="feedTop">
        <h2 className="pageTitle">Feed</h2>
        <p className="pageSub">
          {error ? error : status || "See what everyone is sharing."}
        </p>
      </div>

      <form className="postComposer" onSubmit={handleSubmit}>
        <div className="composerHeader">
          <div className="composerAvatar">
            {currentMember?.picture ? (
              <img src={currentMember.picture} alt={currentMember.name} />
            ) : (
              <span>{currentMember?.name?.[0] ?? "D"}</span>
            )}
          </div>
          <div>
            <div className="composerTitle">
              {currentMember?.name || "Guest"}
            </div>
            <div className="composerSubtitle">
              Share an update with the DALI community.
            </div>
          </div>
        </div>

        <textarea
          className="composerInput"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="What are you working on?"
          rows={3}
          maxLength={400}
        />

        <div className="composerFooter">
          <span className="charCount">{content.length}/400</span>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </form>

      {posts.length === 0 ? (
        <div className="emptyCard">
          <div className="emptyTitle">No posts yet</div>
          <div className="emptyText">
            Start the conversation with your first post.
          </div>
        </div>
      ) : (
        <div className="postsList">
          {posts.map((post) => {
            const likedByUser = post.likes?.users?.some(
              (id) => String(id) === String(currentMember?.id)
            );
            const likeCount = post.likes?.count ?? 0;
            const authorName =
              post.authorName || post.author?.name || "Unknown";
            const timestamp = formatTimestamp(post.createdAt || post.updatedAt);

            return (
              <article key={post._id} className="postCard">
                <div className="postHeader">
                  <div className="postAuthor">
                    <div className="authorAvatar">
                      <span>{authorName[0]}</span>
                    </div>
                    <div>
                      <div className="authorName">{authorName}</div>
                      {timestamp && (
                        <div className="postMeta">{timestamp}</div>
                      )}
                    </div>
                  </div>
                </div>

                <p className="postContent">{post.content}</p>

                <div className="postActions">
                  <button
                    type="button"
                    className={`likeButton ${likedByUser ? "liked" : ""}`}
                    onClick={() => handleLike(post._id)}
                    disabled={pendingLikes.includes(post._id)}
                  >
                    {likedByUser ? "♥ Liked" : "♡ Like"}
                  </button>
                  <span className="likeCount">
                    {likeCount} {likeCount === 1 ? "like" : "likes"}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
