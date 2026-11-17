import mongoose from "mongoose";

const accountSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
        maxlength: 254,
    },
    password: {
        type: String,
        required: true,
        select: false,
        maxlength: 72,
    },
    mobile: {
        type: String,
        required: true,
        trim: true,
        maxlength: 32,
    },
    usertype: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    city: {
        type: String,
        trim: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    activeToken: { type: String, default: null, select: false },
    activeTokens: { type: [String], default: [], select: false },
    failedLoginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, default: null, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpiresAt: Date,
    verificationToken: { type: String, select: false },
    verificationTokenExpiresAt: Date,
    isVerified: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true
    },
}, { timestamps: true, versionKey: false })

const AccountModel = mongoose.model("account", accountSchema)

export default AccountModel
