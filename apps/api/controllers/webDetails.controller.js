import WebDetailsModel from '../models/webDetails.model.js';
import { DEFAULT_WEBSITE_CONTENT, mergeWebsiteContent, validateContentPatch, flattenContentPatch, publicWebsiteContent } from '../../../shared/siteContent.js';
import { logError } from '../utils/logger.js';

export const DEFAULT_SERVICES = DEFAULT_WEBSITE_CONTENT.services;
export const DEFAULT_PROCESS_STEPS = DEFAULT_WEBSITE_CONTENT.processSteps;
export const DEFAULT_CRM_TASKS = DEFAULT_WEBSITE_CONTENT.crmTasks;
export const DEFAULT_CALENDAR_EVENTS = DEFAULT_WEBSITE_CONTENT.calendarEvents;

export { publicWebsiteContent };

export const getWebDetails = async (_req, res) => {
    try {
        // Reads never create records or repopulate deliberately deleted lists.
        const details = await WebDetailsModel.findOne().lean();
        return res.status(200).json({ success: true, data: publicWebsiteContent(mergeWebsiteContent(details)) });
    } catch (error) {
        logError('Failed to fetch website details', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch website details.' });
    }
};

export const getAdminWebDetails = async (_req, res) => {
    try {
        const details = await WebDetailsModel.findOne().lean();
        return res.status(200).json({ success: true, data: mergeWebsiteContent(details) });
    } catch (error) {
        logError('Failed to fetch admin website details', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch website details.' });
    }
};
export const updateWebDetails = async (req, res) => {
    const problem = validateContentPatch(req.body);
    if (problem) return res.status(400).json({ success: false, message: problem });
    if (req.body.email !== undefined && !/^\S+@\S+\.\S+$/.test(req.body.email)) return res.status(400).json({ success: false, message: 'Invalid email format.' });
    for (const link of req.body.socialLinks || []) {
        if (!link.platform?.trim() || !/^https?:\/\//i.test(link.url || '')) return res.status(400).json({ success: false, message: 'Each social link requires a platform and HTTP URL.' });
    }
    const update = flattenContentPatch(req.body);
    if (!Object.keys(update).length) return res.status(400).json({ success: false, message: 'No content changes supplied.' });
    try {
        const details = await WebDetailsModel.findOneAndUpdate({}, { $set: update }, { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true }).lean();
        return res.status(200).json({ success: true, message: 'Website details updated successfully.', data: mergeWebsiteContent(details) });
    } catch (error) {
        if (['ValidationError', 'CastError'].includes(error.name)) return res.status(400).json({ success: false, message: 'Invalid website content.' });
        logError('Failed to update website details', error);
        return res.status(500).json({ success: false, message: 'Failed to update website details.' });
    }
};
