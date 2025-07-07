import Company from '../models/Company.js';
import mongoose from 'mongoose';
import InterviewCall from '../models/InterviewCall.js';

// Create a new company
export const createCompany = async (req, res) => {
  try {
    const newCompany = new Company(req.body);
    const saved = await newCompany.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Error adding company', error: err.message });
  }
};

// Get all companies
// Get all companies (with optional status filter)
// ✅ Get recently updated company
//  export const getCompanies = async (req, res) => {
//   try {
//     const recentCompany = await Company.findOne()
//       .sort({ updatedAt: -1 })
//       .populate('positions interviewCalls') // adjust as per your schema
//       .lean();

//     if (!recentCompany) {
//       return res.status(200).json({ company: null });
//     }

//     return res.status(200).json({ company: recentCompany });
//   } catch (error) {
//     console.error("❌ Error in getCompanies:", error);
//     return res.status(500).json({ message: "Failed to fetch companies." });
//   }
// };



export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching companies', error: err.message });
  }
};
// Get the most recently created or updated company
// export const getRecentCompany = async (req, res) => {
//   try {
//     const recentCompany = await Company.findOne()
//       .sort({ updatedAt: -1 })  // Get the most recently updated/created
//       .populate('positions.placed', 'name rollNo') // optional: show placed students
//       .lean();

//     if (!recentCompany) {
//       return res.status(404).json({ message: "No recent company found." });
//     }

//     res.status(200).json({ company: recentCompany });
//   } catch (err) {
//     console.error("❌ Error fetching recent company:", err);
//     res.status(500).json({ message: "Server error while fetching recent company." });
//   }
// };
// GET /api/companies/recent
export const getRecentCompany = async (req, res) => {
  try {
    const recentCompanies = await Company.find()
      .sort({ updatedAt: -1 })  // ✅ Return all companies, most recent first
      .populate('positions.placed', 'name rollNo')  // optional: include placed students
      .lean();

    if (!recentCompanies || recentCompanies.length === 0) {
      return res.status(404).json({ message: "No companies found." });
    }

    res.status(200).json({ companies: recentCompanies });  // ✅ changed from "company" to "companies"
  } catch (err) {
    console.error("❌ Error fetching companies:", err);
    res.status(500).json({ message: "Server error while fetching companies." });
  }
};



// Get company by ID
export const getCompanyById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid company ID' });
  }

  try {
    const company = await Company.findById(id).populate({
      path: 'positions.placed',
      model: 'Student',
      select: 'name email status'
    });

    if (!company) {
      return res.status(404).json({ message: `Company not found: ${id}` });
    }

    res.status(200).json(company);
  } catch (err) {
    console.error('Error fetching company:', err);
    res.status(500).json({ message: 'Server error fetching company' });
  }
};

// Update company
export const updateCompany = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid company ID' });
  }

  try {
    const updated = await Company.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Company not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating company', error: err.message });
  }
};

// Delete company
export const deleteCompany = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid company ID' });
  }

  try {
    const company = await Company.findById(id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    await Company.findByIdAndDelete(id);
    res.json({ message: 'Company removed' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting company', error: err.message });
  }
};

// Get companies with their interview calls
export const getCompaniesWithInterviewCalls = async (req, res) => {
  try {
    const companies = await Company.find().lean();

    const companiesWithCalls = await Promise.all(
      companies.map(async (company) => {
        const calls = await InterviewCall.find({ companyId: company._id })
          .populate('positionId', 'positionName')
          .populate('shortlisted', 'name')
          .populate('placed', 'name')
          .lean();

        return { ...company, interviewCalls: calls };
      })
    );

    res.json(companiesWithCalls);
  } catch (error) {
    console.error('Error fetching companies with calls:', error);
    res.status(500).json({ message: 'Server error fetching companies with interview calls' });
  }
};
// Update status of a position in a company
// Update status of a position in a company
export const updatePositionStatus = async (req, res) => {
  const { companyId, positionId } = req.params;
  const { status } = req.body;

  if (!['Closed', 'On-going', 'Hold'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  if (!mongoose.Types.ObjectId.isValid(companyId) || !mongoose.Types.ObjectId.isValid(positionId)) {
    return res.status(400).json({ message: 'Invalid company or position ID' });
  }

  try {
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    // Find the position subdocument by ID
    const position = company.positions.id(positionId);
    if (!position) return res.status(404).json({ message: 'Position not found' });

    // Update status and save
    position.status = status;
    await company.save();

    res.status(200).json({ message: 'Status updated successfully', position });
  } catch (err) {
    console.error('Error updating position status:', err);
    res.status(500).json({ message: 'Server error updating position status' });
  }
};
// export const getCompanyStats = async (req, res) => {
//   try {
//     const { date, month } = req.query;
//     let filter = {};

//     if (date) {
//       const start = new Date(date);
//       const end = new Date(date);
//       end.setDate(end.getDate() + 1);
//       filter.createdAt = { $gte: start, $lt: end };
//     } else if (month) {
//       const start = new Date(`${month}-01`);
//       const end = new Date(start);
//       end.setMonth(end.getMonth() + 1);
//       filter.createdAt = { $gte: start, $lt: end };
//     }

//     const count = await Company.countDocuments(filter);
//     res.json({ count });
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching company stats', error: error.message });
//   }
// };


// export const getCompanyStats = async (req, res) => {
//   try {
//     const { date, month } = req.query;

//     if (!date && !month) {
//       return res.status(400).json({ message: 'Missing date or month parameter' });
//     }

//     let filter = {};

//     if (date) {
//       const start = new Date(date);
//       const end = new Date(date);
//       end.setDate(end.getDate() + 1);
//       filter.createdAt = { $gte: start, $lt: end };
//     } else if (month) {
//       const start = new Date(`${month}-01`);
//       const end = new Date(start);
//       end.setMonth(end.getMonth() + 1);
//       filter.createdAt = { $gte: start, $lt: end };
//     }

//     const count = await Company.countDocuments(filter);
//     return res.status(200).json({ count });
//   } catch (error) {
//     console.error("Error fetching company stats:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };



// GET /api/companies/stats?date=2025-06-21
export const getCompanyStats = async (req, res) => {
  try {
    const { date, month } = req.query;

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const filter = {
        positions: {
          $elemMatch: {
            openingDate: { $gte: start, $lte: end }
          }
        }
      };

      console.log("Searching for date:", date, filter);

      const result = await Company.find(filter).limit(5);
      console.log("Matched docs:", result);

      const count = await Company.countDocuments(filter);
      return res.json({ count });
    }

    if (month) {
      const start = new Date(`${month}-01`);
      const end = new Date(`${month}-31`);
      end.setHours(23, 59, 59, 999);

      const filter = {
        positions: {
          $elemMatch: {
            openingDate: { $gte: start, $lte: end }
          }
        }
      };

      console.log("Searching for month:", month, filter);

      const result = await Company.find(filter).limit(5);
      console.log("Matched docs:", result);

      const count = await Company.countDocuments(filter);
      return res.json({ count });
    }

    res.status(400).json({ message: "Missing date or month" });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// controllers/companyController.js

export const addPositionToCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { positionName, openingDate } = req.body;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Create new position object
    const newPosition = {
      positionName,
      openingDate,
      status: 'On-going',
      placed: []
    };

    // ✅ Add position
    company.positions.push(newPosition);

    // ✅ Update lastOpeningDate and updatedAt
    company.lastOpeningDate = new Date(openingDate);
    company.updatedAt = new Date(); // this is optional if you have timestamps enabled

    // ✅ Save updated company
    await company.save();

    res.status(200).json({ message: 'Position added and company updated', company });
  } catch (error) {
    console.error('Error adding position:', error);
    res.status(500).json({ message: 'Server error while adding position' });
  }
};
