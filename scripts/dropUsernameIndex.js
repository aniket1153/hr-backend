import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/test')
  .then(async () => {
    console.log('✅ MongoDB connected');
    const result = await mongoose.connection.collection('users').dropIndex('username_1');
    console.log('✅ Index dropped:', result);
    process.exit(0);
  }).catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
