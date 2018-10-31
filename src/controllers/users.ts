import { BaseContext } from "koa";
import { User } from "../entity/user";
import { getUserById } from "../repositories/user";

// TODO just allow a user to fetch selfr only
export const getUser = async (ctx: BaseContext) => {
  const userId = (ctx as any).params.id || undefined;

  let user: User | undefined;

  if (userId) {
    user = await getUserById(userId);
  }

  if (user) {
    // return OK status code and loaded user object
    ctx.status = 200;
    ctx.body = user;
  } else {
    // return a NOT FOUND status code and error message
    ctx.status = 404;
    ctx.body = "The user you are trying to retrieve doesn't exist in the db";
  }
};
