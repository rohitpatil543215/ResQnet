import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

const connectDB = async () => {
    try {
        let uri = process.env.MONGODB_URI;

        // If no real URI configured, spin up an in-memory MongoDB
        if (!uri || uri.includes('demo@cluster0.demo') || uri.includes('your_')) {
            console.log('🧠 Starting in-memory MongoDB (no external DB required)...');
            mongod = await MongoMemoryServer.create();
            uri = mongod.getUri();
            console.log(`✅ In-memory MongoDB started at ${uri}`);
        }

        const conn = await mongoose.connect(uri);
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
