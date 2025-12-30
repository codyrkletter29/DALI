import { useEffect, useMemo, useState } from "react";
import { createPost, fetchPosts, togglePostLike } from "../api/posts";
import { fetchMember } from "../api/members";
import MemberProfileCard from "../components/MemberProfileCard";
import "../styles/FeedPage.css";
import "../styles/ProfilePage.css";

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
  const [activeMemberId, setActiveMemberId] = useState(null);
  const [activeMember, setActiveMember] = useState(null);
  const [profileStatus, setProfileStatus] = useState("");
  const [likesPost, setLikesPost] = useState(null);

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

  useEffect(() => {
    if (!activeMemberId) return;
    let isMounted = true;
    setProfileStatus("Loading profile...");
    setActiveMember(null);

    fetchMember(activeMemberId)
      .then((data) => data.member)
      .then((member) => {
        if (!isMounted) return;
        setActiveMember(member);
        setProfileStatus("");
      })
      .catch(() => {
        if (!isMounted) return;
        setProfileStatus("Failed to load profile.");
      });

    return () => {
      isMounted = false;
    };
  }, [activeMemberId]);

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
              (user) =>
                String(user?._id || user) === String(currentMember?.id)
            );
            const likeCount = post.likes?.count ?? 0;
            const authorName =
              post.authorName || post.author?.name || "Unknown";
            const authorId = post.author?._id || post.author;
            const authorPicture = post.author?.picture;
            const timestamp = formatTimestamp(post.createdAt || post.updatedAt);

            return (
              <article key={post._id} className="postCard">
                <div className="postHeader">
                  <div className="postAuthor">
                    <button
                      type="button"
                      className="authorButton"
                      onClick={() => authorId && setActiveMemberId(authorId)}
                    >
                      <div className="authorAvatar">
                        {authorPicture ? (
                          <img src={authorPicture} alt={authorName} />
                        ) : (
                          <span>{authorName[0]}</span>
                        )}
                      </div>
                      <div>
                        <div className="authorName">{authorName}</div>
                        {timestamp && (
                          <div className="postMeta">{timestamp}</div>
                        )}
                      </div>
                    </button>
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
                  <button
                    type="button"
                    className="likeCountButton"
                    onClick={() => setLikesPost(post)}
                    disabled={likeCount === 0}
                  >
                    {likeCount} {likeCount === 1 ? "like" : "likes"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {activeMemberId && (
        <div className="modalOverlay" onClick={() => setActiveMemberId(null)}>
          <div
            className="modalContent"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modalHeader">
              <h3>Member Profile</h3>
              <button
                type="button"
                className="modalClose"
                onClick={() => setActiveMemberId(null)}
              >
                ×
              </button>
            </div>
            <div className="modalBody">
              {profileStatus && (
                <p className="modalStatus">{profileStatus}</p>
              )}
              {activeMember && <MemberProfileCard member={activeMember} />}
            </div>
          </div>
        </div>
      )}

      {likesPost && (
        <div className="modalOverlay" onClick={() => setLikesPost(null)}>
          <div
            className="modalContent modalCompact"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modalHeader">
              <h3>Liked by</h3>
              <button
                type="button"
                className="modalClose"
                onClick={() => setLikesPost(null)}
              >
                ×
              </button>
            </div>
            <div className="modalBody">
              {likesPost.likes?.users?.length ? (
                <ul className="likesList">
                  {likesPost.likes.users.map((user, index) => {
                    const userName = user?.name || "Member";
                    const userPicture = user?.picture;
                    const userId = user?._id;
                    return (
                      <li
                        key={userId || `${userName}-${index}`}
                        className="likesItem"
                      >
                        <button
                          type="button"
                          className="likesItemButton"
                          onClick={() => {
                            if (userId) {
                              setLikesPost(null);
                              setActiveMemberId(userId);
                            }
                          }}
                          disabled={!userId}
                        >
                          <div className="likesAvatar">
                            {userPicture ? (
                              <img src={userPicture} alt={userName} />
                            ) : (
                              <span>{userName[0]}</span>
                            )}
                          </div>
                          <span>{userName}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="modalStatus">No likes yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
