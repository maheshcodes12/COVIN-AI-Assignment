import { createObjectCsvWriter } from "csv-writer";
import pool from "../database.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

// Define the directory where CSV files will be saved
const csvDirectory = "./generated_files"; // Specify your desired path here

// Ensure the directory exists
if (!fs.existsSync(csvDirectory)) {
	fs.mkdirSync(csvDirectory);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function generateBalanceSheetForUser(req, res) {
	try {
		const { user_id } = req.query;

		// 1. Fetch expense data for the user
		const result = await pool.query(
			`
            SELECT e.expense_id, e.amount, ep.split, ep.paid
            FROM expenses e
            JOIN expense_participants ep 
            ON e.expense_id = ep.expense_id
            WHERE ep.participant_id = $1
        `,
			[user_id]
		);

		if (result.rows.length === 0) {
			return res
				.status(404)
				.json({ message: "No expenses found for the user" });
		}

		// 2. Define CSV writer
		const csvWriter = createObjectCsvWriter({
			path: join(csvDirectory, `balance_sheet_${user_id}.csv`), // Use hard-coded path
			header: [
				{ id: "expense_id", title: "Expense ID" },
				{ id: "amount", title: "Amount" },
				{ id: "split", title: "Split Amount" },
				{ id: "paid", title: "Paid Amount" },
			],
		});

		// 3. Write data to CSV
		await csvWriter.writeRecords(result.rows);

		// 4. Send the CSV file as a response
		const filePath = join(csvDirectory, `balance_sheet_${user_id}.csv`);
		res.download(filePath, `balance_sheet_${user_id}.csv`, (err) => {
			if (err) {
				console.error("Error downloading the file:", err);
				res.status(500).json({ message: "Error generating the balance sheet" });
			}

			// 5. Optionally delete the file after sending it
			fs.unlink(filePath, (unlinkErr) => {
				if (unlinkErr) console.error("Error deleting the file:", unlinkErr);
			});
		});
	} catch (error) {
		console.error("Error generating balance sheet:", error);
		res.status(500).json({ error: "Internal server error" });
	}
}

export async function generateOverallBalanceSheet(req, res) {
	try {
		// 1. Fetch expenses and participants data
		const result = await pool.query(
			`
            SELECT e.expense_id, SUM(e.amount) AS total_amount, ep.participant_id, SUM(ep.split) AS total_split, SUM(ep.paid) AS total_paid
            FROM expenses e
            JOIN expense_participants ep 
            ON e.expense_id = ep.expense_id
            GROUP BY e.expense_id, ep.participant_id
        `
		);

		if (result.rows.length === 0) {
			return res
				.status(404)
				.json({ message: "No expenses found for any users" });
		}

		// 2. Define CSV writer
		const csvWriter = createObjectCsvWriter({
			path: join(csvDirectory, `overall_balance_sheet.csv`), // Use hard-coded path
			header: [
				{ id: "expense_id", title: "Expense ID" },
				{ id: "total_amount", title: "Total Amount" },
				{ id: "participant_id", title: "Participant ID" },
				{ id: "total_split", title: "Split Amount" },
				{ id: "total_paid", title: "Paid Amount" },
			],
		});

		// 3. Write data to CSV
		await csvWriter.writeRecords(result.rows);

		// 4. Send the CSV file as a response
		const filePath = join(csvDirectory, `overall_balance_sheet.csv`);
		res.download(filePath, `overall_balance_sheet.csv`, (err) => {
			if (err) {
				console.error("Error downloading the file:", err);
				res
					.status(500)
					.json({ message: "Error generating the overall balance sheet" });
			}

			// 5. Optionally delete the file after sending it
			fs.unlink(filePath, (unlinkErr) => {
				if (unlinkErr) console.error("Error deleting the file:", unlinkErr);
			});
		});
	} catch (error) {
		console.error("Error generating overall balance sheet:", error);
		res.status(500).json({ error: "Internal server error" });
	}
}
