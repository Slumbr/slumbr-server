import { Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne } from "typeorm";
import { DeviceToken } from "./deviceToken";
import { User } from "./user";

@Entity()
export class Device {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToMany(_ => DeviceToken, deviceToken => deviceToken.device)
  deviceTokens!: DeviceToken[];

  @ManyToOne(_ => User, user => user.devices, {
    nullable: true,
    onDelete: "SET NULL"
  })
  user?: User;
}
