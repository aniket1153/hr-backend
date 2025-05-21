import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema({
  positionName: { type: String, required: true },
  description: String,
  location: String,
  salary: String,
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }, // ADD THIS
});

const Position = mongoose.model('Position', positionSchema);
export default Position;
