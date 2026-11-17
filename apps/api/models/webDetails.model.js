import mongoose from 'mongoose';
import { DEFAULT_WEBSITE_CONTENT } from '../../../shared/siteContent.js';

// Typed schemas mirror the shared content. Request validation rejects coercion first.
function fieldSchema(value) {
    if (Array.isArray(value)) return { type: [fieldSchema(value[0])], default: undefined };
    if (value && typeof value === 'object') return new mongoose.Schema(Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, fieldSchema(entry)])), { _id: false });
    return { type: typeof value === 'boolean' ? Boolean : typeof value === 'number' ? Number : String };
}
const definition = Object.fromEntries(Object.entries(DEFAULT_WEBSITE_CONTENT).map(([key, value]) => {
    const schema = fieldSchema(value);
    return [key, { type: schema instanceof mongoose.Schema ? schema : schema.type, default: () => structuredClone(value) }];
}));
const webDetailsSchema = new mongoose.Schema(definition, { timestamps: false, versionKey: false });
export default mongoose.model('WebDetails', webDetailsSchema);
