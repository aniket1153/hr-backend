import mongoose from 'mongoose';

const studentSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contact: { type: String },
  course: { type: String },
  status: {
  type: String,
  enum: ['applied', 'shortlisted', 'placed'],
  default: 'applied'
},
  placed: { type: Boolean, default: false },
  resumeUploaded: { type: Boolean, default: false },
  appliedCompany: { type: String, default: '' },    // company name
  position: { type: String, default: '' },          // position title
  placementDate: { type: Date },                     // date of placement
}, {
  timestamps: true,
});

const Student = mongoose.model('Student', studentSchema);

export default Student;
