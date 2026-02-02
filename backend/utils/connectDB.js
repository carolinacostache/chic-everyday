import mongoose from "mongoose";


const connectDB = async () =>{
    try{
    await mongoose.connect(process.env.MONGO_URL)
    console.log("MongoDB is connected")

    }catch(err){
        console.log("MONGODB_CONNECTION_ERROR", err);
        process.exit(1);
    }
};

export default connectDB;