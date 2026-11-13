import mongoose from 'mongoose';

const socialLinkSchema = mongoose.Schema(
    {
        platform: { type: String, required: true, trim: true, lowercase: true },
        url: {
            type: String,
            required: true,
            trim: true,
            match: [/^https?:\/\/.+/, 'Invalid URL format']
        }
    },
    { _id: false }
);

const serviceItemSchema = mongoose.Schema(
    {
        id: { type: String, trim: true },
        slug: { type: String, trim: true },
        title: { type: String, trim: true },
        eyebrow: { type: String, trim: true },
        shortDesc: { type: String, trim: true },
        description: { type: String, trim: true },
        image: { type: String, trim: true },
        route: { type: String, trim: true },
        active: { type: Boolean, default: true },
        highlights: [{ type: String, trim: true }]
    },
    { _id: false }
);

const processStepSchema = mongoose.Schema(
    {
        num: { type: String, trim: true },
        title: { type: String, trim: true },
        desc: { type: String, trim: true }
    },
    { _id: false }
);

const crmTaskSchema = mongoose.Schema(
    {
        id: { type: String, required: true },
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, trim: true },
        category: { type: String, trim: true, default: 'studio' },
        completed: { type: Boolean, default: false }
    },
    { _id: false }
);

const calendarEventSchema = mongoose.Schema(
    {
        id: { type: String, required: true },
        dayIndex: { type: Number, default: 2 },
        timeSlot: { type: String, default: '9:00 am' },
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, trim: true },
        variant: { type: String, default: 'dark' }
    },
    { _id: false }
);

const webDetailsSchema = mongoose.Schema(
    {
        brandName: { type: String, trim: true, default: 'YASHMEEN FIT-OUT' },
        cityLabel: { type: String, trim: true, default: 'DUBAI' },
        workingHours: { type: String, trim: true, default: 'Monday to Friday, 8:30am - 6:00pm' },
        address: {
            street: { type: String, default: 'Bay Square, Building 12, Office G01, Business Bay' },
            city: { type: String, default: 'Dubai' },
            state: { type: String, default: 'Dubai' },
            zipCode: { type: String, default: '' },
            country: { type: String, default: 'UAE' }
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            default: 'info@yfbfitoutcontracting.com',
            match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
        },
        mobile: { type: String, trim: true, default: '+971 54 386 2870' },
        whatsapp: { type: String, trim: true, default: '+971 54 386 2870' },
        socialLinks: [socialLinkSchema],
        hero: {
            kicker: { type: String, default: 'DUBAI · DESIGN / ENGINEERING / FIT-OUT' },
            title: { type: String, default: 'From brief to built.' },
            intro: { type: String, default: 'One team shapes the space, makes the details and delivers the finished interior.' },
            proofMetric: { type: String, default: '35,000 sq. ft.' },
            proofLabel: { type: String, default: 'Al Quoz atelier' },
            ctaText: { type: String, default: 'START A PROJECT' }
        },
        studio: {
            eyebrow: { type: String, default: '(ONE TEAM. EVERY STAGE.)' },
            headline: { type: String, default: 'DESIGN TO DELIVERY' },
            paragraph1: {
                type: String,
                default: 'Yashmeen Future Building brings Dubai fit-out delivery together under one team. Design, spatial engineering, bespoke joinery, architectural glazing, and authority approvals move together under one accountable team, from the first brief to site handover.'
            },
            paragraph2: {
                type: String,
                default: 'In our 35,000 sq. ft. Al Quoz atelier, craftspeople fabricate custom millwork, curved timber, metalwork and acoustic panels. Our MEP and site teams carry those details into the finished space, keeping the approved design and the built result connected.'
            }
        },
        services: [serviceItemSchema],
        processSteps: [processStepSchema],
        crmTasks: [crmTaskSchema],
        calendarEvents: [calendarEventSchema]
    },
    { timestamps: false, versionKey: false }
);

const WebDetailsModel = mongoose.model('WebDetails', webDetailsSchema);

export default WebDetailsModel;
