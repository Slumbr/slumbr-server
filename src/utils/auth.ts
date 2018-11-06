import { Context } from "koa";
import { User } from "../entity/user";

export const getAuthenticatedUserOrThrow = (ctx: Context): User => {
  if (!ctx.isAuthenticated()) {
    return ctx.throw(403);
  }
  const user: User | undefined = ctx.state.user;
  if (!user) {
    return ctx.throw(500, "No user in context despite being authenticated");
  }

  return user;
};
