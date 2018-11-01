import { Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from "typeorm";
import { DeviceRegisterCode } from "./deviceRegisterCode";
import { Device } from "./device";

@Entity()
export class DeviceToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @PrimaryGeneratedColumn("uuid")
  uuid!: string;

  @ManyToOne(_ => Device, device => device.deviceTokens, {
    onDelete: "CASCADE"
  })
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
