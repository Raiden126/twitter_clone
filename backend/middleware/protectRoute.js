import User from "../models/user.model.js";
import jwt from 'jsonwebtoken';

export const protectRoute = async (req,res, next) => {
    try {
        const token = req.cookies.jwt;
        if(!token) {
            return res.status(401).json({ error: "Not authorized, token is required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(!decoded) {
            return res.status(401).json({ error: "Not authorized, token is invalid" });
        }

        const user = await User.findById(decoded.userId).select("-password");

        req.user = user;
        next();
    } catch (error) {
        console.log('error in middleware', error.message)
        return res.status(500).json({ error: "Internal server error"});
    }
}