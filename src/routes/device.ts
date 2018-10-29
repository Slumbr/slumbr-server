import * as Router from "koa-router";
import * as deviceController from "../controllers/device";

export const addDeviceRoutes = (router: Router) => {
  router.post("/api/device", deviceController.createDevice);
  router.post("/api/device/link", deviceController.linkDeviceToUser);
  router.get("/api/device", deviceController.getAllDevicesForLoggedInUser);
};
