import Organization from "../models/Organization.js";

// Get organization details
export const getOrganization = async (req, res) => {
  try {
    const org = await Organization.findById(
      req.user.organizationId
    );

    res.json(org);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// Update organization details
export const updateOrganization = async (req, res) => {
  try {
    const org = await Organization.findByIdAndUpdate(
      req.user.organizationId,
      req.body,
      { new: true }
    );

    res.json(org);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};