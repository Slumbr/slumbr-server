import { runSingletonServer } from "./server";

runSingletonServer().catch(err => {
  console.error(err);
  process.exit(1);
});
