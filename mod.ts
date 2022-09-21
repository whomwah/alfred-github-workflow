import Workflow from "./src/workflow.ts";
import Action from "./src/action.ts";
import { log } from "./src/helpers/log.ts";

switch (true) {
  case Deno.args[0] === "action": {
    await Action(Deno.args[1]);
    break;
  }
  default:
    log(await Workflow(Deno.args[1] || ""));
}
