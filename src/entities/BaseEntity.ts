import { Database } from "../database/db";
import dotenv from 'dotenv'

//Initialize DB Connection
dotenv.config()

const db: Database = new Database(
    process.env.DB_USER!, 
    process.env.DB_PASSWORD!, 
    process.env.DB_HOST!,
    process.env.DB_PORT!, 
    process.env.DB_NAME!,
    process.env.DB_DIALECT!,
)

//Connect
db.connect()

export { db }

