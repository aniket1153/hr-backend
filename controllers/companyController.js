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
export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching companies', error: err.message });
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
