import AppliedStudent from '../models/AppliedStudent.js';
import Student from '../models/Student.js';
import Company from '../models/Company.js';

export const applyStudentsToCompany = async (req, res) => {
  try {
    const { studentIds, companyId, positionId } = req.body;

    if (!studentIds || !companyId || !positionId) {
      return res.status(400).json({ message: 'Missing data' });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const appliedStudents = await Promise.all(
      studentIds.map(async (sid) => {
        const exists = await AppliedStudent.findOne({ studentId: sid, companyId, positionId });

        if (!exists) {
          await AppliedStudent.create({
            studentId: sid,
            companyId,
            positionId,
          });
        }

        // ✅ Update Student model fields here
        await Student.findByIdAndUpdate(sid, {
          status: 'applied',
          appliedCompany: company.companyName,
          position: company.position, // optional
        });

        return sid;
      })
    );

    res.status(201).json({
      message: 'Students successfully applied and updated',
      data: appliedStudents.filter(Boolean),
    });

  } catch (error) {
    console.error('Error applying students:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
