import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { deleteNotification, deleteNotifications, getNotifications } from "../controllers/notification.controllers.js";

const router = express.Router();

router.get('/', protectRoute, getNotifications);
router.delete('/', protectRoute, deleteNotifications);
router.delete('/:id', protectRoute, deleteNotification); //TODO

export default router;