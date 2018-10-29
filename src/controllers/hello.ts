import { BaseContext } from "koa";

export const helloWorld = (ctx: BaseContext) => {
  ctx.body = "Hello World!";
};
