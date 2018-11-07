import { stopSingletonServer } from "../../server";

import * as chai from "chai";
// @ts-ignore
import * as chaiHttp from "chai-http";

chai.should();
chai.use(chaiHttp);

import * as typeorm from "typeorm";
import { config } from "../../config";
import { Connection } from "typeorm";
import {
  createDeviceRegisterCodeWithDeviceAndToken,
  getDeviceRegisterCodeWithDeviceAndToken
} from "../../repositories/device";
import { getOrInsertUserByEmail } from "../../repositories/user";
import { User } from "../../entity/user";
import * as Koa from "koa";
import { appPromise } from "../../app";
import { getCookiesStringFromResponse } from "../helpers/cookies";

const email = "email@example.com";
const password = "hunter2";

describe("device", () => {
  let app: Koa;
  let connection: Connection;

  const deleteAllDevicesCodesAndTokens = async () => {
    await connection
      .createQueryRunner()
      .query(`DELETE FROM "device_register_code"`);
    await connection.createQueryRunner().query(`DELETE FROM "device_token"`);
    await connection.createQueryRunner().query(`DELETE FROM "device"`);
  };

  const createTestUser = async () => {
    const getOrInsertResult = await getOrInsertUserByEmail(email, password);
    return getOrInsertResult.value;
  };

  let testUser: User;
  let loggedInAgent: ReturnType<typeof chai.request.agent>;
  let loggedInCookies: string;

  beforeAll(async () => {
    app = await appPromise;
    connection = await typeorm.createConnection({
      ...config.ormConfig,
      name: "test"
    });
    testUser = await createTestUser();
    loggedInAgent = chai.request.agent(app.callback());
    const resp = await loggedInAgent
      .post("/api/auth/login")
      .set("content-type", "application/x-www-form-urlencoded")
      .send({ email, password });

    loggedInCookies = getCookiesStringFromResponse(resp);

    resp.status.should.equal(200);
  });
  afterAll(async () => {
    await stopSingletonServer();
    await connection.close();
    await loggedInAgent.close();
  });

  describe("POST /api/device", () => {
    beforeEach(async () => {
      await deleteAllDevicesCodesAndTokens();
    });

    it("should add a device, register code, and token, to the database and return 200", async () => {
      const res = await chai
        .request(app.callback())
        .post("/api/device")
        .set("content-type", "application/x-www-form-urlencoded");

      res.status.should.equal(200);
      res.type.should.equal("application/json");
      expect(res.body.deviceToken).toBeTruthy();
      expect(res.body.deviceRegisterCode).toBeTruthy();
      const bodyDeviceRegisterCode = res.body.deviceRegisterCode;

      const deviceRegisterCode = await getDeviceRegisterCodeWithDeviceAndToken(
        bodyDeviceRegisterCode
      );
      expect(deviceRegisterCode).toBeTruthy();
      deviceRegisterCode!.uuid.should.equal(bodyDeviceRegisterCode);
      expect(deviceRegisterCode!.deviceToken).toBeTruthy();
      deviceRegisterCode!.deviceToken.uuid.should.equal(res.body.deviceToken);
      expect(deviceRegisterCode!.deviceToken.device).toBeTruthy();
      expect(deviceRegisterCode!.deviceToken.device.user).toBeFalsy();
    });
  });

  describe.only("POST /api/device/link", () => {
    beforeEach(async () => {
      await deleteAllDevicesCodesAndTokens();
    });

    it("should add the currently logged in user to the device and return 200", async () => {
      const deviceRegisterCodeDb = await createDeviceRegisterCodeWithDeviceAndToken();

      const res = await loggedInAgent
        .post("/api/device/link")
        .set("cookie", loggedInCookies)
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ deviceRegisterCode: deviceRegisterCodeDb.uuid });

      res.status.should.equal(200);
      res.type.should.equal("application/json");

      const deviceRegisterCode = await getDeviceRegisterCodeWithDeviceAndToken(
        deviceRegisterCodeDb.uuid
      );
      expect(deviceRegisterCode).toBeTruthy();
      expect(deviceRegisterCode!.deviceToken.device.user).toBeTruthy();
      deviceRegisterCode!.deviceToken.device.user!.id.should.equal(testUser.id);
    });
  });
});
