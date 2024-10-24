import mongoose from "mongoose";

export const connectMongoDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log('monogodb connected')
    } catch (error) {
        console.log('error connect to monogodb', error)
        process.exit(1)
    }
}