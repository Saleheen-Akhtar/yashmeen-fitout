const MIN_FORM_COMPLETION_MS = 1500;

export const handlePublicSubmissionTrap = (req, res) => {
    const honeypot = typeof req.body?.website === "string" ? req.body.website.trim() : "";
    if (honeypot) {
        res.status(201).json({ success: true, message: "Request submitted successfully" });
        return true;
    }

    const startedAt = Number(req.body?.formStartedAt);
    if (Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MIN_FORM_COMPLETION_MS) {
        res.status(400).json({
            success: false,
            message: "Please take a moment to review your details before submitting.",
        });
        return true;
    }

    return false;
};
