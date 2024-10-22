import { Router } from "express";
import {
	addExpense,
	getIndividualExpenses,
	getOverallExpenses,
} from "../controllers/expenseController.js";
import { verifyAndRefreshToken } from "../middlewares/Tokens.js";
const router = Router();

router.post("/add", verifyAndRefreshToken, addExpense);
router.get("/individual", verifyAndRefreshToken, getIndividualExpenses);
router.get("/overall", verifyAndRefreshToken, getOverallExpenses);

export default router;
