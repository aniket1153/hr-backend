import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/test')
  .then(() => {
    console.log('✅ MongoDB connected');
    return addNewUser();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Add new user function
async function addNewUser() {
  try {
    const user = await User.create({
      email: 'aniket.joshi@example.com',     // 🔁 Change to your desired email
      password: 'aniket123',                 // 🔐 This will be hashed (assuming pre-save hook in schema)
      role: 'super-admin'                    // 👤 Valid roles: 'admin', 'super-admin', 'hr'
    });

    console.log('✅ User created successfully:\n', user);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating user:', err.message);
    process.exit(1);
  }
}
