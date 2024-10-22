import pool from "../database.js";

export const getUserDetails = async (req, res) => {
	try {
		const { user_id } = req.query;

		// 1. Get user details
		const result = await pool.query(
			`
            SELECT user_id, name, email, phone FROM users WHERE user_id = $1
        `,
			[user_id]
		);

		console.log(result);

		if (result.rowCount == 0)
			return res.status(404).json({ error: "User not found" });

		return res
			.status(201)
			.json({ message: "Got details successfully", details: result.rows[0] });
	} catch (error) {
		console.error("Error getting user details:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
