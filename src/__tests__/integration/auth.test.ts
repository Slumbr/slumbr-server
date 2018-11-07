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
  getOrInsertUserByEmail,
  getUserByEmail
} from "../../repositories/user";
import * as Koa from "koa";
import { appPromise } from "../../app";
import { getCookiesStringFromResponse } from "../helpers/cookies";

const email = "email@example.com";
const password = "hunter2";

describe("auth", () => {
  let app: Koa;
  let connection: Connection;
  beforeAll(async () => {
    app = await appPromise;
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
    await getOrInsertUserByEmail(email, password);
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
        .request(app.callback())
        .post("/api/auth/register")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ email, password });

      res.status.should.equal(200);
      res.type.should.equal("application/json");
      res.body.should.deep.equal({ email });

      const user = await getUserByEmail(email);
      expect(user).toBeTruthy();
      if (user) {
        const passwordMatches = await user.comparePassword(password);
        expect(passwordMatches).toBeTruthy();
      }
    });
    it("should return 409 if the user already exists", async () => {
      await createTestUser();

      const res = await chai
        .request(app.callback())
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
        .request(app.callback())
        .post("/api/auth/login")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ email, password });

      res.status.should.equal(200);
      res.type.should.equal("application/json");
      res.body.should.deep.equal({ email });
    });

    it("should return an error for invalid password", async () => {
      const res = await chai
        .request(app.callback())
        .post("/api/auth/login")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ email, password: "wrong password" });

      res.status.should.equal(401);
    });

    it("should return an error when there is no user with that email", async () => {
      const res = await chai
        .request(app.callback())
        .post("/api/auth/login")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ email: "wrong.email@example.com", password });

      res.status.should.equal(401);
    });
  });

  describe("POST /api/auth/status", () => {
    let loggedInAgent: ReturnType<typeof chai.request.agent>;

    afterAll(async () => {
      await stopSingletonServer();
      await connection.close();
      await loggedInAgent.close();
    });
    beforeAll(async () => {
      await deleteAllUsers();
      await createTestUser();
      loggedInAgent = chai.request.agent(app.callback());
    });

    it("should return false when not logged in", async () => {
      const res = await chai
        .request(app.callback())
        .get("/api/auth/status")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({});

      res.status.should.equal(200);
      res.type.should.equal("application/json");
      res.body.should.deep.equal({ authenticated: false });
    });

    it.only("should return true when logged in", async () => {
      const loginRes = await loggedInAgent
        .post("/api/auth/login")
        .set("content-type", "application/x-www-form-urlencoded")
        .send({ email, password });

      loginRes.status.should.equal(200);

      const statusRes = await loggedInAgent
        .get("/api/auth/status")
        .set("cookie", getCookiesStringFromResponse(loginRes))
        .set("content-type", "application/x-www-form-urlencoded")
        .send({});

      statusRes.status.should.equal(200);
      statusRes.type.should.equal("application/json");
      statusRes.body.should.deep.equal({ authenticated: true });
    });
  });
});
