import mongoose from 'mongoose';

const positionSchema = new mongoose.Schema({
  positionName: { type: String, required: true },
  openingDate:   { type: Date,   required: true },
  placed:        [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]  // ← added
});

const companySchema = new mongoose.Schema({
  companyName:    { type: String, required: true },
  hrName:         { type: String, required: true },
  contact:        { type: String, required: true },
  email:          { type: String, required: true },
  location:       { type: String, required: true },
  platform:       { type: String },
  other:          { type: String },
  companyHistory: { type: String },
  positions:      [positionSchema],
  lastOpeningDate:{ type: Date }
}, { timestamps: true });

const Company = mongoose.model('Company', companySchema);
export default Company;
