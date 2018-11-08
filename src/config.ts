import * as path from "path";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

const dotEnvFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";
const dotEnvPath = path.join(__dirname, "..", dotEnvFile);
require("dotenv").config({ path: dotEnvPath });

export const config = {
  port: Number(process.env.PORT || 3000),
  debugLogging: process.env.NODE_ENV == "development",
  dbsslconn: process.env.NODE_ENV != "development",
  sessionSecret: process.env.SESSION_SECRET,
  saltRounds: process.env.NODE_ENV !== "test" ? 16 : 1,
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  ormConfig: {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    type: "postgres",
    synchronize: process.env.NODE_ENV !== "production",
    logging: false,
    entities: ["src/entity/**/*.ts"],
    migrations: ["src/migration/**/*.ts"],
    subscribers: ["src/subscriber/**/*.ts"],
    cli: {
      entitiesDir: "src/entity",
      migrationsDir: "src/migration",
      subscribersDir: "src/subscriber"
    }
  } as PostgresConnectionOptions
};
