import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // loading environment variables from .env file

// mongoDB connection URI from environment variables
const mongodbUri = process.env.MONGODB_URI;

// instance of MongoClient to interact with MongoDB
const client = new MongoClient(mongodbUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export const connectDB = async () => {
  try {
    await client.connect(); // connecting to MongoDB
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Connection Error: ', error);
    process.exit(1); // exiting the process if connection fails
  }
};

export const getClient = () => client;
export const ObjectId = mongoose.Types.ObjectId;

