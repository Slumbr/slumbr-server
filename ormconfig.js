const PostgressConnectionStringParser = require("pg-connection-string");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const parsedOptions = PostgressConnectionStringParser.parse(
  process.env.DATABASE_URL
);

module.exports = {
  host: parsedOptions.host || undefined,
  port: parsedOptions.port || undefined,
  username: parsedOptions.user || undefined,
  password: parsedOptions.password || undefined,
  database: parsedOptions.database || undefined,
  type: "postgres",
  synchronize: true,
  logging: false,
  entities: ["src/entity/**/*.ts"],
  migrations: ["src/migration/**/*.ts"],
  subscribers: ["src/subscriber/**/*.ts"],
  cli: {
    entitiesDir: "src/entity",
    migrationsDir: "src/migration",
    subscribersDir: "src/subscriber"
  }
};
