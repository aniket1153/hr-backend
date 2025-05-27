import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  appliedCount: { type: Number, required: true },
  shortlistedCount: { type: Number, required: true },
  placedCount: { type: Number, required: true },
  resumesSent: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Report = mongoose.model('Report', reportSchema);

export default Report;
