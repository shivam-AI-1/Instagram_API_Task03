
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
app.use(express.json());

const uri = "mongodb://localhost:27017/";
const client = new MongoClient(uri);
const dbName = "Instagram";

client.connect().then(() => {
  console.log("Connected to MongoDB");
}).catch(err => {
  console.error("Failed to connect to MongoDB", err);
});

const db = client.db(dbName);
const usersCollection = db.collection("users");
const postsCollection = db.collection("posts");
const commentsCollection = db.collection("comments");
const followersCollection = db.collection("followers");
const storiesCollection = db.collection("stories");

// ---------------- User Management ----------------

// GET /users: Fetch all users
app.get('/users', async (req, res) => {
  try {
    const users = await usersCollection.find({}).toArray();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /users/:userId: Fetch user details by ID
app.get('/users/:userId', async (req, res) => {
  try {
    const user = await usersCollection.findOne({ userId: req.params.userId });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /users: Register a new user
app.post('/users', async (req, res) => {
  try {
    const newUser = req.body;
    await usersCollection.insertOne(newUser);
    res.status(201).json({ message: "User created", user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /users/:userId: Update user bio or profile picture
app.patch('/users/:userId', async (req, res) => {
  try {
    const updates = req.body;
    const result = await usersCollection.updateOne(
      { userId: req.params.userId },
      { $set: updates }
    );
    if (result.matchedCount === 0) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /users/:userId: Delete a user account
app.delete('/users/:userId', async (req, res) => {
  try {
    const result = await usersCollection.deleteOne({ userId: req.params.userId });
    if (result.deletedCount === 0) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- Posts ----------------

// GET /posts: Fetch all posts
app.get('/posts', async (req, res) => {
  try {
    const posts = await postsCollection.find({}).toArray();
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /posts/:postId: Fetch details of a specific post
app.get('/posts/:postId', async (req, res) => {
  try {
    const post = await postsCollection.findOne({ postId: req.params.postId });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /posts: Create a new post
app.post('/posts', async (req, res) => {
  try {
    const newPost = req.body;
    await postsCollection.insertOne(newPost);
    res.status(201).json({ message: "Post created", post: newPost });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /posts/:postId/caption: Update the caption of a post
app.patch('/posts/:postId/caption', async (req, res) => {
  try {
    const { caption } = req.body;
    const result = await postsCollection.updateOne(
      { postId: req.params.postId },
      { $set: { caption } }
    );
    if (result.matchedCount === 0) return res.status(404).json({ message: "Post not found" });
    res.status(200).json({ message: "Caption updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /posts/:postId: Delete a post
app.delete('/posts/:postId', async (req, res) => {
  try {
    const result = await postsCollection.deleteOne({ postId: req.params.postId });
    if (result.deletedCount === 0) return res.status(404).json({ message: "Post not found" });
    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- Comments ----------------

// GET /posts/:postId/comments: Fetch all comments on a post
app.get('/posts/:postId/comments', async (req, res) => {
  try {
    const comments = await commentsCollection.find({ postId: req.params.postId }).toArray();
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /comments: Add a comment to a post
app.post('/comments', async (req, res) => {
  try {
    const newComment = req.body;
    await commentsCollection.insertOne(newComment);
    res.status(201).json({ message: "Comment added", comment: newComment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /comments/:commentId/likes: Increment likes on a comment
app.patch('/comments/:commentId/likes', async (req, res) => {
  try {
    const result = await commentsCollection.updateOne(
      { commentId: req.params.commentId },
      { $inc: { likes: 1 } }
    );
    if (result.matchedCount === 0) return res.status(404).json({ message: "Comment not found" });
    res.status(200).json({ message: "Likes incremented" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /comments/:commentId: Delete a comment
app.delete('/comments/:commentId', async (req, res) => {
  try {
    const result = await commentsCollection.deleteOne({ commentId: req.params.commentId });
    if (result.deletedCount === 0) return res.status(404).json({ message: "Comment not found" });
    res.status(200).json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- Followers ----------------

// GET /users/:userId/followers: Fetch followers of a user
app.get('/users/:userId/followers', async (req, res) => {
  try {
    const followers = await followersCollection.find({ userId: req.params.userId }).toArray();
    res.status(200).json(followers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /followers: Follow a user
app.post('/followers', async (req, res) => {
  try {
    const newFollower = req.body;
    await followersCollection.insertOne(newFollower);
    res.status(201).json({ message: "Followed user", follower: newFollower });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /followers/:followerId: Unfollow a user
app.delete('/followers/:followerId', async (req, res) => {
  try {
    const result = await followersCollection.deleteOne({ followerId: req.params.followerId });
    if (result.deletedCount === 0) return res.status(404).json({ message: "Follower not found" });
    res.status(200).json({ message: "Unfollowed user" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- Stories ----------------

// GET /stories: Fetch all active stories
app.get('/stories', async (req, res) => {
  try {
    const stories = await storiesCollection.find({ expiresAt: { $gte: 29-11-2006 } }).toArray();
    res.status(200).json(stories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /stories: Add a new story
app.post('/stories', async (req, res) => {
  try {
    const newStory = req.body;
    await storiesCollection.insertOne(newStory);
    res.status(201).json({ message: "Story added", story: newStory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /stories/:storyId: Remove a story
app.delete('/stories/:storyId', async (req, res) => {
    try {
      const result = await storiesCollection.deleteOne({ storyId: req.params.storyId });
      if (result.deletedCount === 0) return res.status(404).json({ message: "Story not found" });
      res.status(200).json({ message: "Story deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


// ---------------- Server ----------------
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});