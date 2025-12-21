const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    likes: {
      count: {
        type: Number,
        default: 0,
      },
      users: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Member",
        },
      ],
    },
    comments: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Member",
        },
        authorName: String,
        content: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
