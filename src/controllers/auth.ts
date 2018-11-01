import { Context } from "koa";

import * as passport from "koa-passport";
import { Strategy as LocalStrategy } from "passport-local";
import { OAuth2Strategy as GoogleStrategy } from "passport-google-oauth";

import { User } from "../entity/user";
import { getManager } from "typeorm";
import { config } from "../config";
import { getOrInsertUserByEmail, getUserByEmail } from "../repositories/user";

passport.serializeUser<User, number>((user, done) => {
  done(null, user.id);
});

passport.deserializeUser<User, number>(async (id, done) => {
  try {
    const userRepository = getManager().getRepository(User);
    const user = await userRepository.findOne(id);
    if (!user) {
      return done(Error("no user"), undefined);
    }
    return done(null, user);
  } catch (error) {
    return done(error, undefined);
  }
});

const localStrategyOptions = {
  usernameField: "email"
};

passport.use(
  new LocalStrategy(localStrategyOptions, async (email, password, done) => {
    try {
      const user = await getUserByEmail(email);
      if (!user) return done(null, false);
      if (!user.comparePassword(password)) {
      }
      return done(null, user);
    } catch (error) {
      return done(error, undefined);
    }
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: config.googleClientId,
      clientSecret: config.googleClientSecret,
      callbackURL: "http://localhost:3000/api/auth/google/callback"
    },
    async function(_, __, profile, cb) {
      const primaryEmail =
        profile.emails &&
        profile.emails.find(email => email.type === "account");
      if (!primaryEmail) {
        return cb(Error("No primary email"), undefined);
      }
      const getOrInsertResult = await getOrInsertUserByEmail(
        primaryEmail.value
      );
      const user = getOrInsertResult && getOrInsertResult.user;
      cb(null, user);
    }
  )
);

export const googleAuth = passport.authenticate("google", {
  scope: [
    "https://www.googleapis.com/auth/plus.login",
    "https://www.googleapis.com/auth/plus.profile.emails.read"
  ]
});

export const googleCallback = passport.authenticate("google", {
  successRedirect: "/api/auth/status",
  failureRedirect: "/api/auth/status"
});

export const doLogin = passport.authenticate("local", {
  successRedirect: "/api/auth/status",
  failureRedirect: "/api/auth/status"
});

export const doLogout = (ctx: Context) => {
  ctx.logOut();
  ctx.redirect("/api/auth/status");
};

interface RegisterBody {
  email: string;
  password: string;
}

const isValidRegisterBody = (
  body: Partial<RegisterBody> | null | undefined
): body is RegisterBody => {
  if (!body) return false;
  return !!(
    typeof body.email === "string" && typeof body.password === "string"
  );
};

export const doRegister = async (ctx: Context, next: () => Promise<any>) => {
  const body: Partial<RegisterBody> | null | undefined = ctx.request.body;

  if (!isValidRegisterBody(body)) {
    return ctx.throw(400);
  }

  let getOrInsertResponse;
  try {
    getOrInsertResponse = await getOrInsertUserByEmail(
      body.email,
      body.password
    );
  } catch (error) {
    return ctx.throw(500, error);
  }
  if (!getOrInsertResponse || !getOrInsertResponse.wasInserted) {
    return ctx.throw(409, "User with email already exists");
  }

  return passport.authenticate("local", async (_, user: User) => {
    if (user) {
      await ctx.login(user);
      ctx.body = {
        email: user.email
      };
      return;
    } else {
      return ctx.throw(500);
    }
  })(ctx, next);
};

export const status = async (ctx: Context) => {
  if (ctx.isAuthenticated()) {
    ctx.body = { authenticated: true };
  } else {
    ctx.body = { authenticated: false };
  }
};
