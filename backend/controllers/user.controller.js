import {v2 as cloudinary} from "cloudinary";
import bcrypt from 'bcryptjs'

import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const getUserProfile = async (req, res) => {
    const {username} = req.params;

    try {
        const user = await User.findOne({username}).select("-password");
        if(!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).josn(user);
    } catch (error) {
        console.log('error in getuserprofile', error.message);
        return res.status(500).json({ error: error.message });
    }
}

export const folloUnfollowUser = async (req, res) => {
    try {
        const {id} = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if(id === req.user._id.toString()) {
            return res.status(400).json({ error: "You can't to follow/unfollow yourself" });
        }

        if(!userToModify || !currentUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const isFollowing = currentUser.following.includes(id);

        if(isFollowing) {
            //unfollow the user
            await User.findByIdAndUpdate(id, {$pull: {followers: req.user._id}});
            await User.findByIdAndUpdate(req.user._id, {$pull: {following: id}});
            return res.status(200).json({message: "User unfollowed successfully"})
        } else {
            //follow the user
            await User.findByIdAndUpdate(id, {$push: {followers: req.user._id}});
            await User.findByIdAndUpdate(req.user._id, {$push: {following: id}});
            //send notification to user
            const newNotification = new Notification({
                from: req.user._id,
                to: userToModify._id,
                type: "follow"
            })
            await newNotification.save();

            // todo return the id of the user as a response;
            return res.status(200).json({message: "User followed successfully"});
        }
    } catch (error) {
        console.log('error in getuserprofile', error.message);
        return res.status(500).json({ error: error.message });
    }
}

export const getSuggestedUser = async (req, res) => {
    try {
        const userId = req.user._id;

        const usersFollowedByMe = await User.findById(userId).select("following");
        const users = await User.aggregate([
            {
                $match: {
                    _id: {$ne: userId}
                }
            },
            {
                $sample: {size: 10}
            }
        ])

        const filteredUsers = users.filter(user => !usersFollowedByMe.following.includes(user._id));
        const suggestedUsers = filteredUsers.slice(0, 4);

        suggestedUsers.forEach(user => user.passwrod = null);

        res.status(200).json(suggestedUsers)
    } catch (error) {
        console.log('error in getuserprofile', error.message);
        return res.status(500).json({ error: error.message });
    }
}

export const updateUserProfile = async (req, res) => {
    try {
        const {fullName, email, username, currentPassword, newPassword, bio, link} = req.body
        let {profileImg, coverImg} = req.body;

        const userId = req.user._id;

        let user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if((!newPassword && currentPassword) || (newPassword && !currentPassword)) {
            return res.status(400).json({ error: "Provide both the newpassword and currentpassword" });
        }

        if(currentPassword && newPassword) {
            const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
            if(!isPasswordCorrect) {
                return res.status(400).json({ error: "Invalid current password" });
            }
            if(newPassword.length < 6) {
                return res.status(400).json({ error: "New password must be at least 6 characters long" });
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
        }

        if(profileImg) {
            if(user.profileImg) {
                await cloudinary.uploader.destroy(user.profileImg.split('/').pop().split('.')[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedResponse.secure_url;
        }

        if(coverImg) {
            if(user.coverImg) {
                await cloudinary.uploader.destroy(user.coverImg.split('/').pop().split('.')[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedResponse.secure_url;
        }

        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save();
        //password should be null in response
        user.password = null;

        return res.status(200).json(user);
    } catch (error) {
        console.log('error in getuserprofile', error.message);
        return res.status(500).json({ error: error.message });
    }
}