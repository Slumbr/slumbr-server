import * as Router from "koa-router";
import * as authController from "../controllers/auth";

export const addAuthRoutes = (router: Router) => {
  router.post("/api/auth/register", authController.doRegister);
  router.post("/api/auth/login", authController.doLogin);
  router.post("/api/auth/logout", authController.doLogout);
  router.get("/api/auth/status", authController.status);
};
