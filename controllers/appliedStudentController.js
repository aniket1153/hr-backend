import AppliedStudent from '../models/AppliedStudent.js';
import Student from '../models/Student.js';
import Company from '../models/Company.js'; // ✅ Import Company model

export const applyStudentsToCompany = async (req, res) => {
  try {
    const { studentIds, companyId, positionId } = req.body;

    if (!studentIds || !companyId || !positionId) {
      return res.status(400).json({ message: 'Missing data' });
    }

    const company = await Company.findById(companyId); // ✅ Get company name

    const appliedStudents = await Promise.all(
      studentIds.map(async (sid) => {
        // Check if already applied
        const exists = await AppliedStudent.findOne({ studentId: sid, companyId, positionId });

        if (!exists) {
          await AppliedStudent.create({
            studentId: sid,
            companyId,
            positionId
          });
        }

        // ✅ UPDATE student's status and company name
        await Student.findByIdAndUpdate(sid, {
          status: 'applied',
          appliedCompany: company.companyName,
        });

        return sid;
      })
    );

    res.status(201).json({
      message: 'Students successfully applied',
      data: appliedStudents
    });

  } catch (error) {
    console.error('Error applying students:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
