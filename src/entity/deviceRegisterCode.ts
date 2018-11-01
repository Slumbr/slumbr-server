import { Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { DeviceToken } from "./deviceToken";

@Entity()
export class DeviceRegisterCode {
  @PrimaryGeneratedColumn()
  id!: number;

  @PrimaryGeneratedColumn("uuid")
  uuid!: string;

  @ManyToOne(_ => DeviceToken, deviceToken => deviceToken.deviceRegisterCodes, {
    onDelete: "CASCADE"
  })
  deviceToken!: DeviceToken;
}
