import express from "express";
import { getWebDetails, updateWebDetails } from "../controllers/webDetails.controller.js";
import { protect, adminOnly } from "../middlewares/auth.js";

const webDetailsRouter = express.Router();

webDetailsRouter.get("/details", getWebDetails);
webDetailsRouter.put("/update", protect, adminOnly, updateWebDetails);

export default webDetailsRouter;