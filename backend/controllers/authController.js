import { v4 as uuidv4 } from "uuid";
import pool from "../database.js";
import bcryptjs from "bcryptjs";

import { generateTokens } from "../middlewares/Tokens.js";

export const signup = async (req, res) => {
	const { name, email, password, phone } = req.body;
	const salt = bcryptjs.genSaltSync(10);
	const hash = bcryptjs.hashSync(password, salt);

	try {
		const result = await pool.query(`SELECT * FROM "users" WHERE email=$1`, [
			email,
		]);

		if (result.rows.length > 0) {
			return res.json({ success: false, message: "User already exists" });
		} else {
			const userId = uuidv4();
			await pool.query(
				`INSERT INTO "users" (user_id, name, email, password, phone) VALUES ($1, $2, $3, $4, $5)`,
				[userId, name, email, hash, phone]
			);

			return res.json({
				success: true,
				message: "Signed In successfully",
			});
		}
	} catch (e) {
		console.error("Error executing query:", e);
		res.json({ success: false, message: "Error in backend controller" });
	}
};

export const login = async (req, res) => {
	const { email, password } = req.body;
	var query_result = null;

	try {
		if (email) {
			await pool
				.query(`SELECT * FROM "users" WHERE email=$1`, [email])
				.then(async (result) => {
					if (result.rows.length == 0) {
						return res.json({ success: false, message: "Email not found" });
					}
					query_result = result;
				});
		}

		const password_in_db = query_result?.rows[0].password;
		const password_match = await bcryptjs.compare(password, password_in_db);
		const userid_from_db = query_result?.rows[0].user_id;

		if (password_match) {
			const token = await generateTokens(userid_from_db);

			return res.json({
				success: true,
				accessToken: token,
				message: "Logged in successfully",
			});
		} else {
			return res.json({ success: false, message: "Invalid password" });
		}
	} catch (e) {
		console.error("Error executing query:", e);
		res.json({ success: false, message: "Error in backend controller" });
	}
};
