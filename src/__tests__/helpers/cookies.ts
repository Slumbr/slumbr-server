import { Response } from "superagent";
import { Cookie } from "tough-cookie";

// this monstrosity shouldn't have been needed, probably worth trying to spend
// more time making superagent "Agent" work. In theory it should save
// cookies between requests but seemed like they only saved the first one, which
// was problematic because we need koa:sess and koa:sess.sig
export const getCookiesStringFromResponse = (response: Response): string => {
  const setCookie: string | string[] | undefined =
    response.header["set-cookie"];
  if (!setCookie) {
    return "";
  }
  return (typeof setCookie === "string" ? setCookie : setCookie.join(","))
    .split(",")
    .map((c: string) => Cookie.parse(c))
    .map((c?: Cookie) => (c ? `${c.key}=${c.value}` : ""))
    .join(";");
};
