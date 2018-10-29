import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { IsEmail } from "class-validator";
import * as bcrypt from "bcrypt";
import { config } from "../config";
import { Device } from "./device";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  @IsEmail()
  email!: string;

  @Column({ nullable: true })
  private password?: string;

  async setPasswordHashFromPlainText(plainText: string) {
    this.password = await bcrypt.hash(plainText, config.saltRounds);
  }

  async comparePassword(plainText: string) {
    if (!this.password) {
      return false;
    }
    return bcrypt.compare(plainText, this.password);
  }

  @OneToMany(_ => Device, device => device.user)
  devices!: Device[];
}
