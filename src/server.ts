import { appPromise } from "./app";
import { config } from "./config";
import { Server } from "http";

let singletonServer: Server | null = null;

export const runSingletonServer = async () => {
  const app = await appPromise;

  if (singletonServer) {
    return singletonServer;
  }

  singletonServer = app.listen(config.port, () => {
    console.log("Server listening on port: " + config.port);
  });
  return singletonServer;
};

export const stopSingletonServer = async () => {
  if (singletonServer) {
    singletonServer.close();
    singletonServer = null;
  }
};
