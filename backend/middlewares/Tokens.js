import pool from "../database.js";
import jwt from "jsonwebtoken";

export const generateTokens = async (user_id) => {
	try {
		const accessToken = jwt.sign({ user_id: user_id }, "TokenhasitsSecret", {
			expiresIn: "3d",
		}); // 3 days

		return accessToken;
	} catch (error) {
		console.log(error);
	}
};

export const verifyAndRefreshToken = async (req, res, next) => {
	const accessToken = req.headers["authorization"]?.split(" ")[1];

	if (!accessToken) {
		return res
			.status(401)
			.json({ success: false, message: "No access token provided" });
	}
	let user_id = "";

	try {
		// Extract user_id from the access token
		const decodedAccessToken = jwt.decode(accessToken, { complete: true });
		user_id = decodedAccessToken?.payload?.user_id;

		if (!user_id) {
			return res.status(403).json({ success: false, message: "Invalid token" });
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({ success: false, message: "Server error" });
	}

	// Verify the access token
	jwt.verify(accessToken, "TokenhasitsSecret", async (err, decoded) => {
		if (err && err.name === "TokenExpiredError") {
			// Access token has expired
			try {
				// Generate a new access token
				const newAccessToken = generateTokens(user_id);

				// Send the new access token back to the client
				return res.json({
					success: true,
					accessToken: newAccessToken,
					message: "New access token issued",
				});
			} catch (e) {
				return res.status(403).json({
					success: false,
					message: "Failed to generate new token",
				});
			}
		} else if (err) {
			return res.status(403).json({
				success: false,
				message: "Failed to authenticate access token",
			});
		} else {
			// Access token is valid, attach the decoded payload to the request
			req.user = decoded;
			next();
		}
	});
};
