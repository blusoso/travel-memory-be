import mongoose from "mongoose";
import PostMessage from "../models/postMessage.js";

export const getPosts = async (req, res) => {
  try {
    const postMessages = await PostMessage.find();

    res.status(200).json(postMessages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createPost = async (req, res) => {
  const post = req.body;
  const newPost = new PostMessage({
    ...post,
    creator: req.userId,
    createdAt: new Date().toISOString(),
  });

  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

const checkExistPost = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No post with that id");
};

const checkUserId = (userId) => {
  if (!userId) return res.json({ message: "Unauthenticated" });
};

export const updatePost = async (req, res) => {
  const { id } = req.params;
  const post = req.body;

  checkExistPost(id);

  const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
    new: true,
  });

  res.status(200).json(updatedPost);
};

export const deletePost = async (req, res) => {
  const { id } = req.params;

  checkExistPost(id);

  await PostMessage.findByIdAndRemove(id);

  res.status(202).json({ message: "Post deleted successfully" });
};

export const likePost = async (req, res) => {
  const { id, isLike } = req.params;

  checkUserId(req.userId);
  checkExistPost(id);

  const post = await PostMessage.findById(id);
  // const increaseLikeCount = post.likeCount + 1;
  // const decreaseLikeCount = post.likeCount - 1;
  // post.likeCount = isLike === "true" ? increaseLikeCount : decreaseLikeCount;

  const index = post.likes.findIndex((id) => id === String(req.userId));

  if (index === -1) {
    // like the post
    post.likes.push(req.userId);
  } else {
    // dislike the post
    post.likes = post.likes.filter((id) => id !== String(req.userId));
  }

  const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
    new: true,
  });

  res.status(200).json(updatedPost);
};
