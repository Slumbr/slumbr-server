import * as Router from "koa-router";
import * as helloController from "../controllers/hello";

export const addHelloRoutes = (router: Router) => {
  router.get("/api/hello", helloController.helloWorld);
};
