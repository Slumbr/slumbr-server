import * as Koa from "koa";
import * as bodyParser from "koa-bodyparser";
import * as helmet from "koa-helmet";
import * as cors from "@koa/cors";
import * as winston from "winston";
import { ConnectionOptions, createConnection } from "typeorm";
import "reflect-metadata";

import { logger } from "./logging";
import { config } from "./config";
import { router } from "./routes/routes";
import * as passport from "koa-passport";
import * as session from "koa-session";
import * as RedisStore from "koa-redis";

import * as ormconfig from "../ormconfig";
import * as koaStatic from "koa-static";
import * as path from "path";

// Get DB connection options from env variable
const connectionOptions: ConnectionOptions = {
  ...(ormconfig as any),
  extra: {
    ssl: config.dbsslconn // if not development, will use SSL
  }
};

const runServer = async () => {
  await createConnection(connectionOptions);

  const app = new Koa();

  // Provides important security headers to make your app more secure
  app.use(helmet());

  // Enable cors with default options
  app.use(cors());

  // Logger middleware -> use winston as logger (logging.ts with config)
  app.use(logger(winston));

  // Enable bodyParser with default options
  app.use(bodyParser());

  if (!config.sessionSecret) {
    throw Error("no session secret");
  }
  app.keys = [config.sessionSecret];
  app.use(session({ store: RedisStore({}) }, app));

  require("./controllers/auth");
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(koaStatic(path.join(__dirname, "static")));

  app.use(router.routes()).use(router.allowedMethods());

  app.listen(config.port, () => {
    console.log("Server listening on port: " + config.port);
  });

  return app;
};

runServer()
  .then(() => {
    console.log("Server setup successful");
  })
  .catch(error => {
    console.log("TypeORM connection error: ", error);
  });
