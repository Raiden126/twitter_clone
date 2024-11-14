import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import {v2 as cloudinary} from "cloudinary";
import path from 'path';

import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import postRoutes from './routes/post.routes.js';
import notificationRoutes from './routes/notification.routes.js';

import { connectMongoDB } from './db/connectMongoDB.js';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 5003;

const __dirname = path.resolve()

app.use(cors());
app.use(express.json({limit: "3mb"})); // to parse req body;
app.use(express.urlencoded({ extended: true})); //to parse formdata

app.use(cookieParser()); // to parse cookies

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/notifications", notificationRoutes)

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, '/frontend/dist')))

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'))
    })
}

app.listen(PORT, () => {
    console.log('server is running on', PORT);
    connectMongoDB();
})