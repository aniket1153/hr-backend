import mongoose from 'mongoose';

const InterviewCallSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  positionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Position', required: true },
  interviewDate: { type: Date, required: true },
  description: { type: String },
  requirementsCount: { type: Number },
  resumes: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
      resumeUrl: { type: String }
    }
  ],
  shortlisted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  placed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  status: { type: String, default: "Scheduled" }
}, { timestamps: true });

export default mongoose.model('InterviewCall', InterviewCallSchema);
