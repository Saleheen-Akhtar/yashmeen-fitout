import express from "express"
import { createPost, deletePost, getPosts, getPostDetails, getPostDetailsById, updatePostById, getActivePosts, updatePostStatus } from "../controllers/post.controller.js"
import { postUpload } from "../middlewares/postUpload.js"
import { protect, adminOnly } from "../middlewares/auth.js"

const postRoute = express.Router()

postRoute.get("/getAll", getPosts)
postRoute.get("/getActivePosts", getActivePosts)
postRoute.get("/getBy/:id", getPostDetailsById)
postRoute.get("/getBySlug/:slug", getPostDetails)
postRoute.post("/create", protect, adminOnly, postUpload.single("file"), createPost)
postRoute.delete("/delete/:postId", protect, adminOnly, deletePost)
postRoute.put('/update/:id', protect, adminOnly, postUpload.single("file"), updatePostById);
postRoute.put('/status/:id', protect, adminOnly, updatePostStatus);

export default postRoute