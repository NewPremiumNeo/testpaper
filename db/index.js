import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}`)
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1)
    }
}

// ; (async () => {
//     await mongoose.connect(`${process.env.MONGODB_URL}`)
//       .then(() => { console.log('MongoDB Connected'); })
//       .catch((err) => { console.log('MongoDB Connection FAILED ', err); });
//   })();

export default connectDB