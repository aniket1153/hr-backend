import Student from '../models/Student.js';
import mongoose from 'mongoose';
import Company from '../models/Company.js';
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
    const placedStudents = await Student.find({ placed: true });

    const result = await Promise.all(
      placedStudents.map(async (student) => {
        const interview = await InterviewCall.findOne({
          placed: student._id
        })
        .populate("companyId", "companyName")
        .populate("positionId", "position");

        return {
          id: student._id,
          student: {
            name: student.name,
            email: student.email
          },
          company: {
            name: interview?.companyId?.companyName || "N/A"
          },
          position: interview?.positionId?.position || "N/A",
          placementDate: interview?.interviewDate || student.updatedAt
        };
      })
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching placed students:", error);
    res.status(500).json({ message: "Failed to fetch placed students" });
  }
};

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

// @desc    Update student
// export const updateStudent = async (req, res) => {
//   const { id } = req.params;
//   const validStatuses = ["Applied", "Shortlisted", "Rejected", "On Hold", "Others"];

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.status(400).json({ message: 'Invalid student ID' });
//   }

//   if (req.body.status && !validStatuses.includes(req.body.status)) {
//     return res.status(400).json({ message: 'Invalid status value' });
//   }

//   try {
//     const updateData = {};
//     if (req.body.status) updateData.status = req.body.status;
//     if (req.body.resumeUploaded !== undefined) updateData.resumeUploaded = req.body.resumeUploaded;
//     if (req.body.appliedCompany !== undefined) updateData.appliedCompany = req.body.appliedCompany;
//     if (req.body.name) updateData.name = req.body.name;
//     if (req.body.email) updateData.email = req.body.email;
//     if (req.body.contact) updateData.contact = req.body.contact;
//     if (req.body.course) updateData.course = req.body.course;
//     if (req.body.placed !== undefined) updateData.placed = req.body.placed;

//     const updatedStudent = await Student.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     );

//     if (!updatedStudent) {
//       return res.status(404).json({ message: 'Student not found' });
//     }

//     res.status(200).json(updatedStudent);
//   } catch (error) {
//     console.error('❌ Error while updating student:', error.message);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// }; 

export const updateStudent = async (req, res) => {
  const studentId = req.params.id;
  const updates = req.body;

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({ message: 'Invalid student ID' });
  }

  try {
    // 1️⃣ Update the student
    const student = await Student.findByIdAndUpdate(
      studentId,
      updates,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // 2️⃣ Get the company and position
    const company = await Company.findOne({ companyName: student.appliedCompany });
    if (company) {
      const position = company.positions.find(
        (p) => p.positionName === student.position
      );

      if (position) {
        const sid = student._id.toString();

        // 3️⃣ Add student to placed array if status is "Placed"
        if (updates.status === 'Placed' || updates.placed === true) {
          if (!position.placed.map(String).includes(sid)) {
            position.placed.push(student._id);
            await company.save();
          }
        }

        // 4️⃣ Remove from placed array if status is not placed
        else if (updates.status !== 'Placed' || updates.placed === false) {
          position.placed = position.placed.filter((id) => id.toString() !== sid);
          await company.save();
        }
      }
    }

    res.status(200).json(student);
  } catch (err) {
    console.error('Error updating student:', err);
    res.status(500).json({ message: 'Server error while updating student' });
  }
};

// export const updateStudent = async (req, res) => {
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
