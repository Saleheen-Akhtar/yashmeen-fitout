import WebDetailsModel from "../models/webDetails.model.js";

export const getWebDetails = async (req, res) => {
    try {
        console.log("clicked");
        
        let details = await WebDetailsModel.findOne();

        if (!details) {
            details = await WebDetailsModel.create({});
        }

        return res.status(200).json({
            success: true,
            data: details,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch website details.",
        });
    }
};

export const updateWebDetails = async (req, res) => {
    try {
        const { address, email, mobile, whatsapp, socialLinks } = req.body;

        if (socialLinks !== undefined && !Array.isArray(socialLinks)) {
            return res.status(400).json({
                success: false,
                message: "socialLinks must be an array.",
            });
        }

        if (Array.isArray(socialLinks)) {
            for (const link of socialLinks) {
                if (!link.platform || !link.platform.trim()) {
                    return res.status(400).json({
                        success: false,
                        message: "Each social link requires a platform.",
                    });
                }
                if (!link.url || !/^https?:\/\/.+/.test(link.url.trim())) {
                    return res.status(400).json({
                        success: false,
                        message: `Invalid URL for platform "${link.platform}".`,
                    });
                }
            }
        }

        const update = {};
        if (address !== undefined) update.address = address;
        if (email !== undefined) update.email = email;
        if (mobile !== undefined) update.mobile = mobile;
        if (whatsapp !== undefined) update.whatsapp = whatsapp;
        if (socialLinks !== undefined) update.socialLinks = socialLinks;

        const details = await WebDetailsModel.findOneAndUpdate(
            {},
            { $set: update },
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            }
        );

        return res.status(200).json({
            success: true,
            message: "Website details updated successfully.",
            data: details,
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            const firstError = Object.values(error.errors)[0]?.message || "Validation failed.";
            return res.status(400).json({
                success: false,
                message: firstError,
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update website details.",
        });
    }
};