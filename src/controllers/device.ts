import { Equal, getManager } from "typeorm";
import { Device } from "../entity/device";
import { DeviceToken } from "../entity/deviceToken";
import { Context } from "koa";
import { DeviceRegisterCode } from "../entity/deviceRegisterCode";
import { getAuthenticatedUserOrThrow } from "../utils/auth";

export const createDevice = async (ctx: Context) => {
  const deviceManager = getManager().getRepository(Device);
  const tokenManager = getManager().getRepository(DeviceToken);
  const codeManager = getManager().getRepository(DeviceRegisterCode);

  const device = new Device();
  const token = new DeviceToken();
  const code = new DeviceRegisterCode();

  token.device = device;
  code.deviceToken = token;

  await deviceManager.insert(device);
  await tokenManager.insert(token);
  await codeManager.insert(code);

  ctx.body = {
    deviceToken: token.uuid,
    deviceRegisterCode: code.uuid
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

  const codeManager = getManager().getRepository(DeviceRegisterCode);
  const deviceRepository = getManager().getRepository(Device);
  const code = await codeManager
    .createQueryBuilder("deviceRegisterCode")
    .innerJoinAndSelect("deviceRegisterCode.deviceToken", "deviceToken")
    .innerJoinAndSelect("deviceToken.device", "device")
    .leftJoinAndSelect("device.user", "user")
    .where({ uuid: Equal(inputCode) })
    .getOne();

  if (!code) {
    return ctx.throw(404);
  }

  if (code.deviceToken.device.user) {
    return ctx.throw(409, "Device already assigned to a user");
  }

  const device = code.deviceToken.device;
  device.user = user;
  await deviceRepository.save(device);

  ctx.body = code;
};

export const getAllDevicesForLoggedInUser = async (
  ctx: Context
): Promise<void> => {
  const user = getAuthenticatedUserOrThrow(ctx);
  const deviceManager = getManager().getRepository(Device);
  const devices = await deviceManager.find({ user: { id: Equal(user.id) } });
  ctx.body = devices;
};
