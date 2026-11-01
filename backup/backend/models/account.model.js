import mongoose from "mongoose";

const accountSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"]
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    mobile: {
        type: String,
        required: true,
        trim: true
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
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpiresAt: Date,
    verificationToken: { type: String, select: false },
    verificationTokenExpiresAt: Date,
    // isVerified: {
    //     type: Boolean,
    //     default: false
    // },
    // newAccount: {
    //     type: Boolean,
    //     default: true
    // },
    isActive: {
        type: Boolean,
        default: true
    },
}, { timestamps: true, versionKey: false })

const AccountModel = mongoose.model("account", accountSchema)

export default AccountModel