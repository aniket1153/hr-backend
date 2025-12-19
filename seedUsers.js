import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const users = [
  { email: 'admin@gmail.com', password: 'admin123', role: 'super-admin' },
  { email: 'recruiter1@gmail.com', password: 'rec12345', role: 'hr-admin' },
  { email: 'student1@gmail.com', password: 'stud1234', role: 'student' },
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    await User.deleteMany(); // Optional: remove existing users
    console.log('⚠️ Existing users cleared');

    for (const user of users) {
      const newUser = new User(user);
      await newUser.save();
      console.log(`User created: ${user.email}`);
    }

    console.log('🎉 Users seeded successfully');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
