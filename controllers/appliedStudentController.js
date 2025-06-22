import AppliedStudent from '../models/AppliedStudent.js';
import Student from '../models/Student.js';

export const applyStudentsToCompany = async (req, res) => {
  try {
    const { studentIds, companyId, positionId } = req.body;

    if (!studentIds || !companyId || !positionId) {
      return res.status(400).json({ message: 'Missing data' });
    }

    const appliedStudents = await Promise.all(
      studentIds.map(async (sid) => {
        // Optional: check if already applied
        const exists = await AppliedStudent.findOne({ studentId: sid, companyId, positionId });
        if (!exists) {
          return AppliedStudent.create({
            studentId: sid,
            companyId,
            positionId
          });
        }
        return null;
      })
    );

    res.status(201).json({
      message: 'Students successfully applied',
      data: appliedStudents.filter(Boolean)
    });

  } catch (error) {
    console.error('Error applying students:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
