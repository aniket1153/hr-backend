import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const users = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'super-admin',
  },
  {
    username: 'recruiter1',
    password: 'rec12345',
    role: 'hr-admin',
  },
  {
    username: 'student1',
    password: 'stud1234',
    role: 'student',
  },
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteMany(); // Clear existing users before seeding
    for (const user of users) {
      const newUser = new User(user);
      await newUser.save();
    }
    console.log('Users seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
