import pool from "../database.js";
import { v4 as uuidv4 } from "uuid"; // For generating UUID
import {
	validateEqualMode,
	validatePercentageMode,
	validateExactMode,
} from "../services/validateExpenseInput.js";

export async function addExpense(req, res) {
	const client = await pool.connect();
	try {
		await client.query("BEGIN");

		const { total_amount, participants, mode } = req.body;

		// Check for valid mode
		if (!["equal", "exact", "percentage"].includes(mode)) {
			throw new Error("Invalid mode provided");
		}

		// Validate participants and amounts based on the mode
		if (mode === "equal") {
			validateEqualMode(total_amount, participants);
		} else if (mode === "exact") {
			validateExactMode(total_amount, participants);
		} else if (mode === "percentage") {
			validatePercentageMode(total_amount, participants);
		}

		// 1. Insert the expense into the expenses table
		const expenseId = uuidv4();
		const result = await client.query(
			`
            INSERT INTO expenses (expense_id, amount, created_at)
            VALUES ($1, $2, NOW()) RETURNING *
        `,
			[expenseId, total_amount]
		);

		// 2. Insert the participants into the expense_participants table
		for (const participant of participants) {
			await client.query(
				`
                INSERT INTO expense_participants (expense_id, participant_id, split, paid)
                VALUES ($1, $2, $3, $4)
            `,
				[
					expenseId,
					participant.user_id,
					participant.split_amount,
					participant.paid_amount,
				]
			);
		}

		await client.query("COMMIT");
		res
			.status(201)
			.json({ message: "Expense added successfully", expense: result.rows[0] });
	} catch (error) {
		await client.query("ROLLBACK");
		console.error("Error adding expense:", error);
		res.status(500).json({ error: error.message || "Internal server error" });
	} finally {
		client.release();
	}
}

export async function getIndividualExpenses(req, res) {
	try {
		const { user_id } = req.query;

		const result = await pool.query(
			`
            SELECT e.expense_id , e.amount, ep.split, ep.paid FROM expenses e JOIN expense_participants ep ON e.expense_id = ep.expense_id WHERE ep.participant_id = $1
        `,
			[user_id]
		);

		let total_expense = 0;
		result.rows.forEach((expense) => {
			total_expense += expense.amount;
		});

		res.status(201).json({
			message: "Got expense details successfully",
			total_expense: total_expense,
			details: result.rows,
		});
	} catch (error) {
		console.error("Error getting expense details:", error);
		res.status(500).json({ error: "Internal server error" });
	}
}

export async function getOverallExpenses(req, res) {
	try {
		// Query to get all unique expenses
		const result = await pool.query(`
            SELECT e.expense_id, e.amount
            FROM expenses e
        `);

		// Create a Set to hold unique expense amounts
		const uniqueExpenses = new Set(
			result.rows.map((expense) => parseFloat(expense.amount))
		);

		// Query to get all expenses with their participants for the response
		const expenseDetails = await pool.query(`
            SELECT e.expense_id, e.amount, ep.participant_id, ep.split
            FROM expenses e
            JOIN expense_participants ep ON e.expense_id = ep.expense_id
        `);

		// Structure the response
		const expenses = expenseDetails.rows.map((expense) => ({
			expense_id: expense.expense_id,
			amount: expense.amount,
			participant: expense.participant_id,
			split: expense.split,
		}));

		res.status(200).json({
			message: "Got overall expenses successfully",
			expenses: expenses, // Send all expenses data
		});
	} catch (error) {
		console.error("Error getting overall expenses:", error);
		res.status(500).json({ error: "Internal server error" });
	}
}
