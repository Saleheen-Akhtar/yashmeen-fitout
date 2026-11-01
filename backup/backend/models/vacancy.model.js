import mongoose from "mongoose";

const vacancySchema = mongoose.Schema({
    positionName: { type: String, required: true, trim: true },
    numberOfPositions: { type: Number, required: true, min: 1 },
    experience: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true, index: true },
    aboutPosition: { type: String, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["open", "closed", "filled"], default: "open" }
}, { timestamps: true, versionKey: false });

const VacancyModel = mongoose.model('vacancy', vacancySchema);

export default VacancyModel;