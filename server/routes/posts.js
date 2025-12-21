const express = require("express");
const mongoose = require("mongoose");
const { Post, User, Member } = require("../models");

const router = express.Router();

// GET /api/posts - list posts (newest first)
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate("author", "name")
      .lean();

    res.json({ success: true, posts });
  } catch (err) {
    console.error("GET /api/posts error:", err);
    res.status(500).json({ error: "Failed to load posts" });
  }
});

// GET /api/posts/:id - get single post
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid post id" });

    const post = await Post.findById(id).populate("author", "name").lean();
    if (!post) return res.status(404).json({ error: "Post not found" });

    res.json({ success: true, post });
  } catch (err) {
    console.error("GET /api/posts/:id error:", err);
    res.status(500).json({ error: "Failed to load post" });
  }
});

// POST /api/posts - create post
router.post("/", async (req, res) => {
  try {
    const { content, author, authorName } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ error: "Content is required" });

    // author can be optional (for now), but if provided validate
    let authorId = null;
    if (author) {
      if (!mongoose.Types.ObjectId.isValid(author)) return res.status(400).json({ error: "Invalid author id" });
      const user = await User.findById(author);
      if (!user) return res.status(400).json({ error: "Author not found" });
      authorId = user._id;
    }

    const newPost = new Post({
      content: content.trim(),
      author: authorId,
      authorName: authorName || (authorId ? undefined : "Anonymous"),
    });

    const saved = await newPost.save();
    res.status(201).json({ success: true, post: saved });
  } catch (err) {
    console.error("POST /api/posts error:", err);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// PUT /api/posts/:id/like - toggle like by userId
router.put("/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid post id" });
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ error: "Invalid user id" });

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const already = post.likes.users.find((u) => u.toString() === userId);
    if (already) {
      post.likes.users = post.likes.users.filter((u) => u.toString() !== userId);
      post.likes.count = Math.max(0, post.likes.count - 1);
    } else {
      post.likes.users.push(userId);
      post.likes.count = (post.likes.count || 0) + 1;
    }

    await post.save();
    res.json({ success: true, post });
  } catch (err) {
    console.error("PUT /api/posts/:id/like error:", err);
    res.status(500).json({ error: "Failed to toggle like" });
  }
});

// DELETE /api/posts/:id - delete post (requires userId in body or simple delete)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid post id" });

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // If author exists, only author can delete. If no author, allow delete.
    if (post.author && userId) {
      if (post.author.toString() !== userId) return res.status(403).json({ error: "Not authorized to delete" });
    }

    await Post.deleteOne({ _id: id });
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/posts/:id error:", err);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

module.exports = router;
