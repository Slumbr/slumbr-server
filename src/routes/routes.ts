import * as Router from "koa-router";

import { addUserRoutes } from "./users";
import { addHelloRoutes } from "./hello";
import { addAuthRoutes } from "./auth";
import { addDeviceRoutes } from "./device";

const router = new Router();

addUserRoutes(router);
addHelloRoutes(router);
addAuthRoutes(router);
addDeviceRoutes(router);

export { router };
