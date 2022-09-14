import Workflow from "./lib/workflow.ts";
import Action from "./lib/action.ts";
import { log } from "./helpers/log.ts";

switch (true) {
  case Deno.args[0] === "action": {
    await Action(Deno.args[1]);
    break;
  }
  default:
    log(await Workflow(Deno.args[1] || ""));
}
