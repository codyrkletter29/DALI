import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { PostsContext } from "../context/PostsContext";
import "../styles/Post.css";

export default function Post({ post }) {
  const { user } = useContext(AuthContext);
  const { toggleLike, deletePost } = useContext(PostsContext);

  const isLiked = post.likedBy.includes(user?.id);
  const isAuthor = user?.id === post.authorId;

  const handleLike = () => {
    toggleLike(post.id, user.id);
  };

  const handleDelete = () => {
    deletePost(post.id);
  };

  return (
    <div className="postCard">
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

      <div className="postFooter">
        <button
          className={`likeButton ${isLiked ? "liked" : ""}`}
          onClick={handleLike}
        >
          ❤️ {post.likes}
        </button>

        {isAuthor && (
          <button className="deleteButton" onClick={handleDelete}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
