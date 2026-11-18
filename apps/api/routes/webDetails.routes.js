import express from "express";
import { getWebDetails, getAdminWebDetails, updateWebDetails } from "../controllers/webDetails.controller.js";
import { protect, adminOnly } from "../middlewares/auth.js";

const webDetailsRouter = express.Router();

webDetailsRouter.get("/details", getWebDetails);
webDetailsRouter.get('/admin-details', protect, adminOnly, getAdminWebDetails);
webDetailsRouter.put("/update", protect, adminOnly, updateWebDetails);

export default webDetailsRouter;
