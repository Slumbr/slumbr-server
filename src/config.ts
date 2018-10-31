import * as path from "path";
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const config = {
  port: Number(process.env.PORT || 3000),
  debugLogging: process.env.NODE_ENV == "development",
  dbsslconn: process.env.NODE_ENV != "development",
  sessionSecret: process.env.SESSION_SECRET,
  saltRounds: 16,
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
};

export { config };
