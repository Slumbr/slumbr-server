import { Context } from "koa";

import * as passport from "koa-passport";
import { Strategy as LocalStrategy } from "passport-local";
import { User } from "../entity/user";
import { Equal, getManager, Repository } from "typeorm";

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
      const userRepository = getManager().getRepository(User);
      const user = await userRepository.findOne({
        email: Equal(email)
      });
      if (!user) return done(null, false);
      if (!user.comparePassword(password)) {
      }
      return done(null, user);
    } catch (error) {
      return done(error, undefined);
    }
  })
);

export const doLogin = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login"
});

export const doLogout = (ctx: Context) => {
  ctx.logOut();
  ctx.redirect("/login");
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

  console.log([body, "body"].pop(), body);

  if (!isValidRegisterBody(body)) {
    return ctx.throw(400);
  }

  const userRepository: Repository<User> = getManager().getRepository(User);
  const user = new User();
  user.email = body.email;
  try {
    await user.setPasswordHashFromPlainText(body.password);
  } catch (error) {
    return ctx.throw(400);
  }

  try {
    await userRepository.insert(user);
  } catch (error) {
    return ctx.throw(500, error);
  }

  return passport.authenticate("local", async (_, user: User) => {
    if (user) {
      await ctx.login(user);
      return ctx.redirect("/api/auth/status");
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
