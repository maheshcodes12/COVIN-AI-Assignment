import { Router } from "express";
import {
	generateBalanceSheetForUser,
	generateOverallBalanceSheet,
} from "../controllers/balanceSheetController.js";
import { verifyAndRefreshToken } from "../middlewares/Tokens.js";
const router = Router();

router.get("/user", verifyAndRefreshToken, generateBalanceSheetForUser);
router.get("/overall", verifyAndRefreshToken, generateOverallBalanceSheet);

export default router;
