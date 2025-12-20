import "../styles/FeedPage.css";

export default function FeedPage() {
  return (
    <div className="feedPage">
      <div className="feedTop">
        <h2 className="pageTitle">Feed</h2>
        <p className="pageSub">Coming next: create posts + likes.</p>
      </div>

      <div className="emptyCard">
        <div className="emptyTitle">No posts yet</div>
        <div className="emptyText">
          You’ll add a “Create Post” form and load posts from the backend.
        </div>
      </div>
    </div>
  );
}
