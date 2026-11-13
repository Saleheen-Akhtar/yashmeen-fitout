import mongoose from 'mongoose';

const projectSchema = mongoose.Schema(
    {
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'category',
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        size: { type: String, trim: true },     // e.g. "15210 Sq. ft"
        location: { type: String, trim: true }, // e.g. "Abu Dhabi"
        scope: { type: String, trim: true },    // e.g. "Design and Built Project"
        sector: { type: String, trim: true },   // e.g. "Commercial"
        videoUrl: { type: String, trim: true },
        description: { type: String },
        images: [
            {
                type: String,
                trim: true
            }
        ]
    },
    { timestamps: true, versionKey: false }
);

projectSchema.index({ categoryId: 1 });

const ProjectModel = mongoose.model('Project', projectSchema);

export default ProjectModel;