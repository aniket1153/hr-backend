  import InterviewCall from '../models/InterviewCall.js';
  import mongoose from 'mongoose';
  import Position from '../models/Position.js';

  // Create interview call
  export const createInterviewCall = async (req, res) => {
    try {
      const interviewCall = new InterviewCall(req.body);
      await interviewCall.save();
      res.status(201).json(interviewCall);
    } catch (error) {
      res.status(500).json({ message: 'Error creating interview call', error: error.message });
    }
  };

  // Get all interview calls

  export const getInterviewCalls = async (req, res) => {
  try {
    const interviewCalls = await InterviewCall.find()
      .populate('companyId', 'companyName')          // ✅ for company filter
      .populate('positionId', 'positionName')        // optional
      .populate('shortlisted', 'name')               // optional
      .populate('placed', 'name')                    // ✅ needed
      .populate({ path: 'resumes.student', select: 'name' }) // optional
      .lean(); // use lean() to simplify objects

    res.json(interviewCalls);
  } catch (error) {
    console.error('Error fetching interview calls:', error);
    res.status(500).json({
      message: 'Server error fetching interview calls',
      error: error.message,
    });
  }
};


//   try {
//     const interviewCalls = await InterviewCall.find()
//       .populate('companyId', 'companyName')
//       .populate('positionId', 'positionName')
//       .populate('shortlisted', 'name')
//       .populate('placed', 'name')
//       .populate({ path: 'resumes.student', select: 'name' }) // ✅ This is correct for nested population
//       .lean();

//     res.json(interviewCalls);
//   } catch (error) {
//     console.error('Error fetching interview calls:', error);
//     res.status(500).json({ message: 'Server error fetching interview calls', error: error.message });
//   }
// };


export const getInterviewDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await InterviewCall.findById(id)
      .populate('companyId', 'companyName')
      .populate('positionId', 'positionName')
      .populate('resumes.student', 'name email contact')
      .populate('shortlisted', 'name')
      .populate('placed', 'name')
      .lean();

    if (!data) return res.status(404).json({ message: 'Not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching interview', error: err.message });
  }
};
export const updateInterviewCall = async (req, res) => {
  try {
    const { shortlisted, placed } = req.body;
    const updated = await InterviewCall.findByIdAndUpdate(
      req.params.id,
      { $set: { shortlisted, placed } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating interview call', error: err.message });
  }
};


//   try {
//     console.log('Fetching interview calls...');
//     const interviewCalls = await InterviewCall.find()
//       .populate('companyId', 'companyName')
//       .populate('positionId', 'position')
//       .populate('studentId', 'name')
//       .populate('shortlisted', 'name')
//       .populate('placed', 'name')
//       .lean();

//     console.log('Interview calls fetched:', interviewCalls.length);
//     res.json(interviewCalls);
//   } catch (error) {
//     console.error('Error fetching interview calls:', error);
//     res.status(500).json({ message: 'Server error fetching interview calls', error: error.message });
//   }
// };

  //       .populate('positionId', 'position')
  //       .populate('studentId', 'appliedCompany');

  //     res.json({ interviewCalls });
  //   } catch (error) {
  //     console.error("Error fetching interview calls:", error);
  //     res.status(500).json({ message: 'Server error fetching interview calls' });
  //   }
  // };

  // Get interview call by ID
 

  // Update interview call
  // export const updateInterviewCall = async (req, res) => {
  //   const { id } = req.params;

  //   if (!mongoose.Types.ObjectId.isValid(id)) {
  //     return res.status(400).json({ message: 'Invalid interview call ID' });
  //   }

  //   try {
  //     const updatedCall = await InterviewCall.findByIdAndUpdate(id, req.body, {
  //       new: true,
  //       runValidators: true,
  //     });

  //     if (!updatedCall) {
  //       return res.status(404).json({ message: 'Interview call not found' });
  //     }

  //     res.json(updatedCall);
  //   } catch (error) {
  //     res.status(500).json({ message: 'Error updating interview call', error: error.message });
  //   }
  // };

  // Delete interview call
  export const deleteInterviewCall = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid interview call ID' });
    }

    try {
      const interviewCall = await InterviewCall.findById(id);

      if (!interviewCall) {
        return res.status(404).json({ message: 'Interview call not found' });
      }

      await interviewCall.deleteOne();

      res.json({ message: 'Interview call deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting interview call', error: error.message });
    }
  };
export const getInterviewCallsByStudent = async (req, res) => {
  const { studentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({ message: 'Invalid student ID' });
  }

  try {
    // Find interview calls where studentId is in the studentId array OR shortlisted OR placed
    const interviewCalls = await InterviewCall.find({
      $or: [
        { studentId: studentId },
        { shortlisted: studentId },
        { placed: studentId }
      ]
    })
    .populate('companyId', 'companyName')
    .populate('positionId', 'position')
    .populate('studentId', 'name email')  // optional, to get student details in response
    .lean();

    res.json(interviewCalls);
  } catch (error) {
    console.error('Error fetching interview calls by student:', error);
    res.status(500).json({ message: 'Server error fetching interview calls' });
  }
};
export const getInterviewCallDetails = async (req, res) => {
  try {
    const interviewCalls = await InterviewCall.find()
      .populate("companyId", "companyName")
      .populate("positionId", "position")
      .populate("shortlisted", "name email")
      .populate("placed", "name email");

    res.status(200).json(interviewCalls);
  } catch (err) {
    console.error("Error fetching interview call details:", err);
    res.status(500).json({ message: "Failed to load interview call details" });
  }
  
};

export const getInterviewCallsGroupedByCompany = async (req, res) => {
  try {
    const interviewCalls = await InterviewCall.find()
      .populate('companyId', 'companyName location website')
      .populate('positionId', 'positionName description')
      .populate('shortlisted', 'name email')
      .populate('placed', 'name email')
      .populate('resumes.student', 'name email');

    const grouped = {};

    interviewCalls.forEach((call) => {
      const companyName = call.companyId?.companyName || 'Unknown Company';

      if (!grouped[companyName]) {
        grouped[companyName] = [];
      }

      grouped[companyName].push({
        _id: call._id,
        position: call.positionId
          ? {
              name: call.positionId.positionName,
              description: call.positionId.description,
            }
          : null,
        interviewDate: call.interviewDate,
        status: call.status || 'Scheduled',
        description: call.description || '',
        requirementsCount: call.requirementsCount || 0,
        resumesSentCount: call.resumes.length,
        shortlisted: call.shortlisted,
        placed: call.placed,
      });
    });

    res.status(200).json(grouped);
  } catch (error) {
    console.error('Error fetching interview calls by company:', error);
    res.status(500).json({ message: 'Failed to fetch interview calls grouped by company' });
  }
};

//   try {
//     const calls = await InterviewCall.find()
//       .populate('companyId', 'companyName')
//       .populate('positionId', 'positionName')
//       .populate('shortlisted', 'name')
//       .populate('placed', 'name')
//       .lean();

//     // Group calls by companyName
//     const grouped = calls.reduce((acc, call) => {
//       const company = call.companyId?.companyName || 'Unknown Company';
//       if (!acc[company]) acc[company] = [];
//       acc[company].push(call);
//       return acc;
//     }, {});

//     res.json(grouped);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching interview calls by company', error: error.message });
//   }
// };
export const updateInterviewStatus = async (req, res) => {
  const { id } = req.params;
  const { shortlisted, placed } = req.body;

  try {
    const updated = await InterviewCall.findByIdAndUpdate(
      id,
      { shortlisted, placed },
      { new: true }
    );

    // Update student status
    if (placed?.length) {
      await Student.updateMany({ _id: { $in: placed } }, { $set: { status: 'placed' } });
    }
    if (shortlisted?.length) {
      await Student.updateMany({ _id: { $in: shortlisted } }, { $set: { status: 'shortlisted' } });
    }

    res.json({ message: 'Updated successfully', updated });
  } catch (err) {
    res.status(500).json({ message: 'Error updating status', error: err.message });
  }
};
export const getInterviewCallById = async (req, res) => {
  try {
    const interviewCall = await InterviewCall.findById(req.params.id)
      .populate('companyId', 'companyName')
      .populate('positionId', 'positionName')
      .populate('resumes.student', 'name email phone')
      .populate('shortlisted', 'name')
      .populate('placed', 'name');

    if (!interviewCall) {
      return res.status(404).json({ message: 'Interview call not found' });
    }

    res.json(interviewCall);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};





export const getInterviewCallStats = async (req, res) => {
  try {
    const { date, month } = req.query;
    let filter = {};

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      filter.createdAt = { $gte: start, $lt: end };
    } else if (month) {
      const start = new Date(`${month}-01`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      filter.createdAt = { $gte: start, $lt: end };
    }

    const count = await InterviewCall.countDocuments(filter);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching interview call stats', error: error.message });
  }
};
