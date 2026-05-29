import { Elysia } from "elysia";

const PORT = parseInt(
	process.env.PORT || "3000",
	10,
);
const HOST = process.env.HOST || "0.0.0.0";
const GREETING =
	process.env.GREETING || "Hello Elysia";

const app = new Elysia()
	.get("/", () => GREETING)
	.get("/error", () => {
		throw new Error("Internal server error");
	})
	.get("/api", () => ({
		PORT,
		HOST,
		GREETING,
		NODE_ENV:
			process.env.NODE_ENV || "development",
	}))
	.listen(PORT);
