import { Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { DeviceToken } from "./deviceToken";

@Entity()
export class DeviceRegisterCode {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(_ => DeviceToken, deviceToken => deviceToken.deviceRegisterCodes)
  deviceToken!: DeviceToken;
}
