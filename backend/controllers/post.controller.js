import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import {v2 as cloudinary} from 'cloudinary';

export const createPost = async (req, res) => {
    try {
        const {text} = req.body;
        let {img} = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);

        if(!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if(!text && !img) {
            return res.status(400).json({ error: "Provide text or image" });
        }

        if(img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        const newPost = new Post({
            text,
            img,
            user: userId
        });

        await newPost.save();

        return res.status(200).json(newPost);
    } catch (error) {
        console.log("error in creating post controller",error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if(!post) {
            return res.status(404).json({ error: "Post not found"});
        }

        if(post.user.toString()!== req.user._id.toString()) {
            return res.status(403).json({ error: "Yor are not authorized to delete this post"});
        };

        if(post.img) {
            const imgId = post.img.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: "Post deleted successfully"});
    } catch (error) {
        console.log("error in deleting post controller",error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const commentOnPost = async (req, res) => {
    try {
        const {text} = req.body;
        const postId = req.params.id;
        const userId = req.user._id;

        if(!text) {
            return res.status(400).json({ error: "Please provide a comment text" });
        }

        const post = await Post.findByIdAndUpdate(postId);

        if(!post) {
            return res.status(404).json({ error: "Post not found"});
        }

        const comment = {user: userId, text};

        post.comments.push(comment);
        await post.save();

        return res.status(200).json(post);
    } catch (error) {
        console.log("error in deleting post controller",error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const likeUnlikePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const {id:postId} = req.params;

        const post = await Post.findById(postId);

        if(!post) {
            return res.status(404).json({error: "Post not found"});
        }

        const userLikesPost = post.likes.includes(userId);

        if(userLikesPost){
            //unlike posts
            await Post.updateOne({_id: postId}, {$pull: {likes: userId}});
            await User.updateOne({_id: userId}, {$pull: {likedPosts: postId}});
            return res.status(200).json({message: "Post unliked successfully"});
        } else {
            // like post
            post.likes.push(userId);
            await User.updateOne({_id: userId}, {$push: {likedPosts: postId}});
            await post.save();

            const notification = new Notification({
                from : userId,
                to: post.user,
                type: "like",
            })

            await notification.save();

            return res.status(200).json({message: "Post liked successfully"});
        }
    } catch (error) {
        console.log("error in deleting post controller",error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getAllPosts = async(req, res) => {
    try {
        const posts = await Post.find().sort({createdAt: -1}).populate({path: "user", select: "-password"}).populate({path: "comments.user", select:"-password"});

        if(posts.lengts === 0) {
            return res.status(200).json([]);
        }

        return res.status(200).json(posts);
    } catch (error) {
        console.log("error in deleting post controller",error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getLikedPosts = async(req, res) => {
    const userId = req.params.id;

    try {
        const  user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({error: "User not found"});
        }

        const likedPosts = await Post.find({_id: user.likedPosts}).populate({path: "user", select: "-password"}).populate({path: "comments.user", select: "-password"});

        return res.status(200).json(likedPosts);
    } catch (error) {
        console.log("error in deleting post controller",error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId);

        if(!user) return res.status(404).json({ error: "User not found"});

        const following = user.following;

        const feedPosts = await Post.find({user: {$in: following}}).sort({createdAt: -1}).populate({path: "comments.user", select: "-password"});

        return res.status(200).json(feedPosts);
    } catch (error) {
        console.log("error in deleting post controller",error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getUserPosts = async(req,res) => {
    try {
        // console.log('username', req.params.id)
        const username = req.params.id

        const user = await User.findOne({username});

        if(!user) return res.status(404).json({ error: "User not found"});

        const posts = await Post.find({user: user._id}).sort({createdAt: -1}).populate({path: "comments.user", select: "-password"}); 

        if(!posts) return res.status(404).json({ error: "Post not found"});

        return res.status(200).json(posts);
    } catch (error) {
        console.log("error in deleting post controller",error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}