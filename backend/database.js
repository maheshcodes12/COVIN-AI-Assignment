import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
	user: "postgres",
	password: "Target@95",
	host: "localhost",
	port: "5432",
	database: "covinai",
});

export default pool;
