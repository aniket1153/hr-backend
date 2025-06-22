import mongoose from 'mongoose';

const appliedStudentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  positionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company.positions',  // if positions is subdocument
    required: true
  },
  appliedDate: {
    type: Date,
    default: Date.now
  }
});

const AppliedStudent = mongoose.model('AppliedStudent', appliedStudentSchema);
export default AppliedStudent;
