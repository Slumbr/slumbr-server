import { BaseContext } from "koa";
import { Repository, getManager } from "typeorm";
import { User } from "../entity/user";

// TODO just allow a user to fetch selfr only
export const getUser = async (ctx: BaseContext) => {
  // get a user repository to perform operations with user
  const userRepository: Repository<User> = getManager().getRepository(User);

  const userId = (ctx as any).params.id || undefined;

  let user: User | undefined;

  if (userId) {
    user = await userRepository.findOne(userId);
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
