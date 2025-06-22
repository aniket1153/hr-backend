// export const getReportStats = async (req, res) => {
//   try {
//     const { status, date, month } = req.query;
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

//     let result;

//     if (status === 'placed') {
//       filter.placedCount = { $gt: 0 };
//       result = await Report.aggregate([
//         { $match: filter },
//         { $group: { _id: null, total: { $sum: "$placedCount" } } }
//       ]);
//     } else if (status === 'scheduled') {
//       result = await Report.countDocuments(filter);
//     } else {
//       return res.status(400).json({ message: 'Invalid or missing status' });
//     }

//     const count = result?.[0]?.total || result || 0;
//     res.json({ count: typeof count === 'number' ? count : result });
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching report stats', error: error.message });
//   }
// };
import Report from '../models/Report.js';
import Student from '../models/Student.js';
import Company from '../models/Company.js';
// export const getReportStats = async (req, res) => {
//   try {
//     const { status, date, month } = req.query;

//     if (!status || (!date && !month)) {
//       return res.status(400).json({ message: 'Missing required query parameters (status, date or month)' });
//     }

//     // Filter based on date or month
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

//     const reports = await Report.find(filter);

//     // Calculate based on status param
//     let count = 0;
//     if (status === 'scheduled') {
//       count = reports.reduce((acc, curr) => acc + curr.resumesSent, 0);
//     } else if (status === 'placed') {
//       count = reports.reduce((acc, curr) => acc + curr.placedCount, 0);
//     } else {
//       return res.status(400).json({ message: 'Invalid status. Use scheduled or placed.' });
//     }

//     res.status(200).json({ count });
//   } catch (error) {
//     console.error('Error fetching report stats:', error);
//     res.status(500).json({ message: 'Error fetching report stats' });
//   }
// };

export const getReportStats = async (req, res) => {
  try {
    const { status, date, month } = req.query;

    let filter = {};
    if (status) {
      filter.status = status;
    }

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    } else if (month) {
      const start = new Date(`${month}-01`);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      filter.createdAt = { $gte: start, $lt: end };
    }

    // You should have status field in Report schema for this to work!
    const count = await Report.countDocuments(filter);
    res.json({ count });
  } catch (error) {
    console.error('Error in getReportStats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export const getPlacementSummary = async (req, res) => {
  try {
    const companies = await Company.find();

    const summary = await Promise.all(companies.map(async (company, index) => {
      const placedStudents = await Student.find({
        appliedCompany: company.companyName,  // ✅ Match using companyName field
        status: 'placed'
      });

      return {
        srNo: index + 1,
        _id: company._id,
        name: company.companyName,           // ✅ Use companyName here
        location: company.location,
        placedCount: placedStudents.length
      };
    }));

    res.json(summary);
  } catch (error) {
    console.error('❌ Error fetching summary:', error.message);
    res.status(500).json({ message: 'Error fetching summary' });
  }
};

export const getPlacementDetails = async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    const allPlaced = [];

    for (const pos of company.positions) {
      const students = await Student.find({
        appliedCompany: company.companyName,
        position: pos.positionName,
        status: 'placed'
      });

      students.forEach(std => {
        allPlaced.push({
          name: std.name,
          placedOn: std.placementDate,
          position: pos.positionName
        });
      });
    }

    res.json(allPlaced);
  } catch (error) {
    console.error('Error fetching placement details:', error.message);
    res.status(500).json({ message: 'Error fetching placement details' });
  }
};

