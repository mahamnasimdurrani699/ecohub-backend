import mongoose from "mongoose";

export const connectDB = async() =>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoBD connected ${conn.connection.host}`)
    } catch (error) {
        console.log("Error Connecting to mongoDB" , error.message);
        process.exit(1);
        
    }
}