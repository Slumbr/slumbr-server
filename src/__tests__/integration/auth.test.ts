import { runSingletonServer, stopSingletonServer } from "../../server";

import * as chai from "chai";
// @ts-ignore
import * as chaiHttp from "chai-http";

chai.should();
chai.use(chaiHttp);

import { Server } from "http";
import * as typeorm from "typeorm";
import { config } from "../../config";
import { Connection, Equal } from "typeorm";
import { User } from "../../entity/user";

const email = "email@example.com";
const password = "hunter2";

describe("auth", () => {
  let server: Server;
  let connection: Connection;
  beforeAll(async () => {
    server = await runSingletonServer();
    connection = await typeorm.createConnection({
      ...config.ormConfig,
      name: "test"
    });
  });
  afterAll(async () => {
    await stopSingletonServer();
    await connection.close();
  });

  const createTestUser = async () => {
    const user = new User();
    user.email = email;
    await user.setPasswordHashFromPlainText(password);
    await connection.getRepository(User).insert(user);
  };

  const getUserWithEmail = async () => {
    return await connection
      .getRepository(User)
      .findOne({ email: Equal(email) });
  };

  const deleteAllUsers = async () => {
    await connection.createQueryRunner().query(`DELETE FROM "user"`);
  };

  describe("POST /api/auth/register", () => {
    beforeEach(async () => {
      await deleteAllUsers();
    });

    it("should add a user to the database and return 200", async () => {
      const res = await chai
        .request(server)
        .post("/api/auth/register")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ email, password });

      res.status.should.equal(200);
      res.type.should.equal("application/json");
      res.body.should.deep.equal({ email });

      const user = await getUserWithEmail();
      expect(user).toBeTruthy();
      if (user) {
        const passwordMatches = await user.comparePassword(password);
        expect(passwordMatches).toBeTruthy();
      }
    });
    it("should return 409 if the user already exists", async () => {
      await createTestUser();

      const res = await chai
        .request(server)
        .post("/api/auth/register")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ email, password });

      res.status.should.equal(409);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeAll(async () => {
      await deleteAllUsers();
      await createTestUser();
    });

    it("should return 200 and set cookies if user is in database with right password", async () => {
      const res = await chai
        .request(server)
        .post("/api/auth/login")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ email, password });

      res.status.should.equal(200);
      res.type.should.equal("application/json");
      res.body.should.deep.equal({ email });
    });

    it("should return an error for invalid password", async () => {
      const res = await chai
        .request(server)
        .post("/api/auth/login")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ email, password: "wrong password" });

      res.status.should.equal(401);
    });

    it("should return an error when there is no user with that email", async () => {
      const res = await chai
        .request(server)
        .post("/api/auth/login")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ email: "wrong.email@example.com", password });

      res.status.should.equal(401);
    });
  });
});
