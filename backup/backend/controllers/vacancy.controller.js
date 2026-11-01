import mongoose from 'mongoose';
import VacancyModel from '../models/vacancy.model.js';

const VALID_STATUSES = ["open", "closed", "filled"];

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createVacancy = async (req, res) => {
    try {
        const { positionName, numberOfPositions, experience, location, aboutPosition, endDate, status } = req.body;

        if (
            !positionName ||
            numberOfPositions === undefined || numberOfPositions === null || numberOfPositions === "" ||
            !experience ||
            !location ||
            !aboutPosition ||
            !endDate
        ) {
            return res.status(400).json({
                success: false,
                message: "positionName, numberOfPositions, experience, location, aboutPosition and endDate are required",
            });
        }

        if (isNaN(numberOfPositions) || Number(numberOfPositions) < 1) {
            return res.status(400).json({ success: false, message: "numberOfPositions must be a number greater than or equal to 1" });
        }

        if (status !== undefined && !VALID_STATUSES.includes(status)) {
            return res.status(400).json({ success: false, message: `status must be one of: ${VALID_STATUSES.join(", ")}` });
        }

        const vacancy = await VacancyModel.create({
            positionName,
            numberOfPositions,
            experience,
            location,
            aboutPosition,
            endDate,
            status,
        });

        return res.status(201).json({ success: true, message: "Vacancy created successfully", data: vacancy });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: "Failed to create vacancy", error: error.message });
    }
};

export const getAllVacancies = async (req, res) => {
    try {
        console.log("clicked");
        
        const { status } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const vacancies = await VacancyModel.find(filter).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: vacancies });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch vacancies", error: error.message });
    }
};

export const getOpenVacancies = async (req, res) => {
    try {
        const { location } = req.query;

        const filter = { status: "open" };
        if (location) filter.location = new RegExp(escapeRegex(location), "i");

        const vacancies = await VacancyModel.find(filter).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: vacancies });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch vacancies", error: error.message });
    }
};

export const getVacancyById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid vacancy id" });
        }

        const vacancy = await VacancyModel.findById(id);
        if (!vacancy) {
            return res.status(404).json({ success: false, message: "Vacancy not found" });
        }
        return res.status(200).json({ success: true, data: vacancy });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to fetch vacancy", error: error.message });
    }
};

export const updateVacancy = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid vacancy id" });
        }

        const { positionName, numberOfPositions, experience, location, aboutPosition, endDate, status } = req.body;

        if (numberOfPositions !== undefined && (isNaN(numberOfPositions) || Number(numberOfPositions) < 1)) {
            return res.status(400).json({ success: false, message: "numberOfPositions must be a number greater than or equal to 1" });
        }

        if (status !== undefined && !VALID_STATUSES.includes(status)) {
            return res.status(400).json({ success: false, message: `status must be one of: ${VALID_STATUSES.join(", ")}` });
        }

        const vacancy = await VacancyModel.findById(id);
        if (!vacancy) {
            return res.status(404).json({ success: false, message: "Vacancy not found" });
        }

        if (positionName !== undefined) vacancy.positionName = positionName;
        if (numberOfPositions !== undefined) vacancy.numberOfPositions = numberOfPositions;
        if (experience !== undefined) vacancy.experience = experience;
        if (location !== undefined) vacancy.location = location;
        if (aboutPosition !== undefined) vacancy.aboutPosition = aboutPosition;
        if (endDate !== undefined) vacancy.endDate = endDate;
        if (status !== undefined) vacancy.status = status;

        await vacancy.save();

        return res.status(200).json({ success: true, message: "Vacancy updated successfully", data: vacancy });
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: "Failed to update vacancy", error: error.message });
    }
};

export const deleteVacancy = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid vacancy id" });
        }

        const vacancy = await VacancyModel.findByIdAndDelete(id);
        if (!vacancy) {
            return res.status(404).json({ success: false, message: "Vacancy not found" });
        }
        return res.status(200).json({ success: true, message: "Vacancy deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to delete vacancy", error: error.message });
    }
};

export const updateVacancyStatus = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "Invalid vacancy id" });
        }

        const { status } = req.body;
        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({ success: false, message: `status must be one of: ${VALID_STATUSES.join(", ")}` });
        }

        const vacancy = await VacancyModel.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
        if (!vacancy) {
            return res.status(404).json({ success: false, message: "Vacancy not found" });
        }

        return res.status(200).json({ success: true, message: "Vacancy status updated", data: vacancy });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Failed to update vacancy status", error: error.message });
    }
};