// Post component with like and delete functionality developed with ChatGPT assistance
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { PostsContext } from "../context/PostsContext";
import "../styles/Post.css";

export default function Post({ post }) {
  const { user } = useContext(AuthContext);
  const { toggleLike, deletePost } = useContext(PostsContext);

  const isLiked = post.likedBy.includes(user?.id);
  const isAuthor = user?.id === post.authorId;

  // Toggle like status for current user
  const handleLike = () => {
    toggleLike(post.id, user.id);
  };

  // Delete post if user is the author
  const handleDelete = () => {
    deletePost(post.id);
  };

  return (
    <div className="postCard">
      {/* Post header with author info */}
      <div className="postHeader">
        <span className="userAvatarSmall">{post.authorName?.[0]}</span>
        <div className="postInfo">
          <div className="postAuthor">{post.authorName}</div>
          <div className="postTime">
            {post.createdAt.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="postContent">
        <p>{post.content}</p>
      </div>

      {/* Post actions: like and delete */}
      <div className="postFooter">
        <button
          className={`likeButton ${isLiked ? "liked" : ""}`}
          onClick={handleLike}
        >
          ❤️ {post.likes}
        </button>

        {/* Only show delete button to post author */}
        {isAuthor && (
          <button className="deleteButton" onClick={handleDelete}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
