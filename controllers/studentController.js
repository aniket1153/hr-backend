import Student from '../models/Student.js';
import mongoose from 'mongoose';
import Company from '../models/Company.js';
import InterviewCall from '../models/InterviewCall.js';
// @desc    Create a new student
export const createStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      contact,
      course,
      status,
      resumeUploaded,
      appliedCompany,
    } = req.body;

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student already exists' });
    }

    const student = new Student({
      name,
      email,
      contact,
      course,
      status,
      resumeUploaded,
      appliedCompany,
    });

    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all students with optional filters
export const getStudents = async (req, res) => {
  try {
    const { course, status } = req.query;

    const query = {};
    if (course) query.course = course;
    if (status) query.status = status;

    const students = await Student.find(query).sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get placed students
export const getPlacedStudents = async (req, res) => {
  try {
    // Find students who are marked as placed
    const placedStudents = await Student.find({ isPlaced: true })
      .select('_id name placedCompany.companyName')  // select only needed fields
      .lean();

    if (!placedStudents.length) {
      return res.status(200).json([]);  // no placed students found
    }

    res.status(200).json(placedStudents);
  } catch (error) {
    console.error('Error fetching placed students:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// export const getPlacedStudents = async (req, res) => {
//   try {
//     const placedStudents = await Student.find({ placed: true });

//     const result = await Promise.all(
//       placedStudents.map(async (student) => {
//         const interview = await InterviewCall.findOne({
//           placed: student._id
//         })
//           .populate('companyId', 'companyName')
//           .populate('positionId', 'position');

//         return {
//           id: student._id,
//           name: student.name,
//           email: student.email,
//           rollNo: student.rollNo,
//           department: student.department,
//           company: interview?.companyId?.companyName || 'N/A',
//           position: interview?.positionId?.position || 'N/A',
//           placementDate: interview?.interviewDate || student.updatedAt,
//         };
//       })
//     );

//     res.status(200).json(result);
//   } catch (error) {
//     console.error('Error fetching placed students:', error);
//     res.status(500).json({ message: 'Failed to fetch placed students' });
//   }
// };

// export const getPlacedStudents = async (req, res) => {
//   try {
//     const placedStudents = await Student.find({ placed: true }).sort({ createdAt: -1 });
//     res.json(placedStudents);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// @desc    Get student by ID
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


export const updateStudent = async (req, res) => {
  try {
    const studentId = req.params.id;
    const updates = req.body;
    const sid = studentId.toString();

    // Set placement status and placementDate
    if (updates.status === 'Placed' || updates.placed === true) {
      updates.placed = true;
      updates.placementDate = new Date(); // match schema field name
    } else {
      updates.placed = false;
      updates.placementDate = null;
    }

    // Update student
    const student = await Student.findByIdAndUpdate(
      studentId,
      updates,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Find company
    const company = await Company.findOne({ companyName: student.appliedCompany });
    if (!company) {
      return res.status(404).json({ error: 'Company not found for this student' });
    }

    // Find position
    const position = company.positions.find(
      (p) => p.positionName === student.position
    );
    if (!position) {
      return res.status(404).json({ error: 'Position not found for this student in the company' });
    }

    // Sync placement
    if (student.placed) {
      if (!position.placed.map(String).includes(sid)) {
        position.placed.push(student._id);
      }
    } else {
      position.placed = position.placed.filter((id) => id.toString() !== sid);
    }

    await company.save();

    res.status(200).json({ message: 'Student updated successfully', student });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
};




//   const studentId = req.params.id;
//   const updates = req.body;

//   if (!mongoose.Types.ObjectId.isValid(studentId)) {
//     return res.status(400).json({ message: 'Invalid student ID' });
//   }

//   try {
//     // 1️⃣ Update the student record
//     const student = await Student.findByIdAndUpdate(
//       studentId,
//       updates,
//       { new: true, runValidators: true }
//     );
//     if (!student) {
//       return res.status(404).json({ message: 'Student not found' });
//     }

//     // 2️⃣ If they were just placed, sync into Company.positions.placed
//     if (updates.placed === true || updates.status === 'Placed') {
//       // Assuming student.appliedCompany holds the companyName,
//       // and student.position holds the positionName
//       const company = await Company.findOne({ companyName: student.appliedCompany });
//       if (company) {
//         // Find the matching position subdoc
//         const pos = company.positions.find(
//           (p) => p.positionName === student.position
//         );
//         if (pos) {
//           // Avoid duplicates
//           const sid = student._id.toString();
//           if (!pos.placed.map(String).includes(sid)) {
//             pos.placed.push(student._id);
//             await company.save();
//           }
//         }
//       }
//     }

//     // 3️⃣ Optionally, if they were un‐placed (placed → false), remove them
//     if (updates.placed === false) {
//       const company = await Company.findOne({ companyName: student.appliedCompany });
//       if (company) {
//         const pos = company.positions.find(
//           (p) => p.positionName === student.position
//         );
//         if (pos) {
//           pos.placed = pos.placed.filter((id) => id.toString() !== studentId);
//           await company.save();
//         }
//       }
//     }

//     res.status(200).json(student);
//   } catch (err) {
//     console.error('Error updating student:', err);
//     res.status(500).json({ message: 'Server error while updating student' });
//   }
// };


// @desc    Delete student
// export const deleteStudent = async (req, res) => {
//   const { id } = req.params;

//   // Validate MongoDB ObjectId
//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(400).json({ message: 'Invalid student ID' });
//   }

//   try {
//     const student = await Student.findById(id);
//     if (!student) {
//       return res.status(404).json({ message: 'Student not found' });
//     }

//     await student.deleteOne(); // use deleteOne instead of remove (preferred)
//     res.json({ message: 'Student removed' });
//   } catch (error) {
//     console.error('Delete error:', error);  // Log error for debugging
//     res.status(500).json({ message: 'Server error' });
//   }
// };
export const deleteStudent = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid student ID' });
  }

  try {
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await student.deleteOne(); // safer & recommended over remove()
    res.json({ message: 'Student removed' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// studentController.js


// Your other student related functions...

export const placeStudent = async (req, res) => {
  try {
    const { studentId, interviewCallId, companyId, positionId, placementDate } = req.body;

    if (!studentId || !interviewCallId || !companyId || !positionId || !placementDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 1. Update InterviewCall placed array
    const interviewCall = await InterviewCall.findById(interviewCallId);
    if (!interviewCall) return res.status(404).json({ message: "Interview call not found" });

    if (!interviewCall.placed.includes(studentId)) {
      interviewCall.placed.push(studentId);
      await interviewCall.save();
    }

    // 2. Update Company positions placed array
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    const position = company.positions.id(positionId);
    if (!position) return res.status(404).json({ message: "Position not found in company" });

    if (!position.placed.includes(studentId)) {
      position.placed.push(studentId);
      await company.save();
    }

    // 3. Update Student placed status and date
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    student.placed = true;
    student.placementDate = placementDate;
    await student.save();

    return res.status(200).json({ message: "Student placement updated successfully" });

  } catch (error) {
    console.error("Error placing student:", error);
    return res.status(500).json({ message: "Failed to place student" });
  }
};
// controllers/studentController.js

export const updateStudentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update student status' });
  }
};

