import { Equal, getManager } from "typeorm";
import { Device } from "../entity/device";
import { DeviceToken } from "../entity/deviceToken";
import { DeviceRegisterCode } from "../entity/deviceRegisterCode";
import { User } from "../entity/user";
import * as createError from "http-errors";

export const createDeviceRegisterCodeWithDeviceAndToken = async (): Promise<
  DeviceRegisterCode
> => {
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

  return code;
};

export const getDeviceRegisterCodeWithDeviceAndToken = async (
  deviceRegisterCode: string
): Promise<DeviceRegisterCode | undefined> => {
  const codeManager = await getManager().getRepository(DeviceRegisterCode);
  return await codeManager
    .createQueryBuilder("deviceRegisterCode")
    .innerJoinAndSelect("deviceRegisterCode.deviceToken", "deviceToken")
    .innerJoinAndSelect("deviceToken.device", "device")
    .leftJoinAndSelect("device.user", "user")
    .where({ uuid: Equal(deviceRegisterCode) })
    .getOne();
};

export const setUserForDevice = async (device: Device, user: User) => {
  const deviceRepository = getManager().getRepository(Device);
  if (device.user) {
    throw createError(409, "Device already assigned to a user");
  }
  device.user = user;
  await deviceRepository.save(device);
};

export const getDevicesForUser = async (user: User) => {
  const deviceManager = getManager().getRepository(Device);
  return await deviceManager.find({ user: { id: Equal(user.id) } });
};
