import { Elysia } from "elysia";
import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { db } from "./db";
import { waitlist } from "./db/schema";

const PORT = parseInt(
	process.env.PORT || "3000",
	10,
);
const HOST = process.env.HOST || "0.0.0.0";
const GREETING =
	process.env.GREETING || "Hello Elysia";

const migrationClient = postgres(process.env.DATABASE_URL!, { max: 1 });
await migrate(drizzle(migrationClient), { migrationsFolder: "drizzle" });
await migrationClient.end();

const app = new Elysia()
	.get("/", () => GREETING)
	.get("/add", ({ query }) => {
		const a = parseFloat(query.a as string);
		const b = parseFloat(query.b as string);
		if (isNaN(a) || isNaN(b)) {
			return { error: "Query params 'a' and 'b' must be numbers" };
		}
		return { result: a + b };
	})
	.post("/waitlist", async ({ body, set }) => {
		const { email } = body as { email: string };
		if (!email || typeof email !== "string") {
			set.status = 400;
			return { error: "Email is required" };
		}

		const existing = await db
			.select()
			.from(waitlist)
			.where(eq(waitlist.email, email))
			.limit(1);
		if (existing.length > 0) {
			set.status = 409;
			return { error: "Email already on the waitlist" };
		}

		await db.insert(waitlist).values({ email });
		set.status = 201;
		return { message: "Successfully joined the waitlist" };
	})
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
