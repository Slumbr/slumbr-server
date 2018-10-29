import * as Router from "koa-router";
import * as userController from "../controllers/users";

export const addUserRoutes = (router: Router) => {
  router.get("/api/users/:id", userController.getUser);
};
