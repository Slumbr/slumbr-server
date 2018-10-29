import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm";
import { DeviceRegisterCode } from "./deviceRegisterCode";
import { Device } from "./device";

@Entity()
export class DeviceToken {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(_ => Device, device => device.deviceTokens)
  device!: Device;

  @OneToMany(
    _ => DeviceRegisterCode,
    deviceRegisterCode => deviceRegisterCode.deviceToken,
    {
      nullable: true
    }
  )
  deviceRegisterCodes?: DeviceRegisterCode[];
}
