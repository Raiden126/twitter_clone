import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { folloUnfollowUser, getSuggestedUser, getUserProfile, updateUserProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get('/profile/:username',protectRoute, getUserProfile);
router.get('/suggested',protectRoute, getSuggestedUser);
router.post('/follow/:id',protectRoute, folloUnfollowUser);
router.post('/update', protectRoute, updateUserProfile);

export default router;