import { Context } from "koa";
import { getAuthenticatedUserOrThrow } from "../utils/auth";
import {
  createDeviceRegisterCodeWithDeviceAndToken,
  getDeviceRegisterCodeWithDeviceAndToken,
  getDevicesForUser,
  setUserForDevice
} from "../repositories/device";

export const createDevice = async (ctx: Context) => {
  const deviceRegisterCode = await createDeviceRegisterCodeWithDeviceAndToken();

  ctx.body = {
    deviceToken: deviceRegisterCode.deviceToken.uuid,
    deviceRegisterCode: deviceRegisterCode.uuid
  };
};

interface LinkBody {
  deviceRegisterCode: string;
}

export const linkDeviceToUser = async (ctx: Context): Promise<void> => {
  const user = getAuthenticatedUserOrThrow(ctx);
  const body: Partial<LinkBody> | null | undefined = ctx.request.body;

  const inputCode = body && body.deviceRegisterCode;

  if (!inputCode) {
    return ctx.throw(400);
  }

  const code = await getDeviceRegisterCodeWithDeviceAndToken(inputCode);
  if (!code) {
    return ctx.throw(404);
  }
  await setUserForDevice(code.deviceToken.device, user);

  ctx.body = code;
};

export const getAllDevicesForLoggedInUser = async (
  ctx: Context
): Promise<void> => {
  const user = getAuthenticatedUserOrThrow(ctx);
  const devices = await getDevicesForUser(user);
  ctx.body = devices;
};
