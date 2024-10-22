import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRoute from "./routes/authRoute.js";
import expenseRoute from "./routes/expenseRoute.js";
import getUserDetailsRoute from "./routes/getUserDetailsRoute.js";
import balanceSheetRoute from "./routes/balanceSheetRoute.js";

dotenv.config({
	path: ".env",
});
const app = express();
app.use(express.json());
app.use(cors());

app.use("/auth", authRoute);
app.use("/expenses", expenseRoute);
app.use("/users", getUserDetailsRoute);
app.use("/balance-sheet", balanceSheetRoute);

const PORT = process.env.PORT;

app.listen(PORT, () => {
	console.log(`Sever is listening on port ${PORT}`);
});
