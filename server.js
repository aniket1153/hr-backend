import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import interviewCallRoutes from './routes/interviewCallRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import appliedStudentRoutes from './routes/appliedStudentRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Connect MongoDB (Mongoose 8.x compatible)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/interview-calls', interviewCallRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/applied-students', appliedStudentRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('🚀 Server is up and running!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
