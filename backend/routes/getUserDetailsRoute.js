import express from "express";
const router = express.Router();
import { getUserDetails } from "../controllers/getUserDetails.js";

router.get("/get", getUserDetails);

export default router;
