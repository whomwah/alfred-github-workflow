import Builder from "../helpers/builder.ts";
import { Item } from "./item.ts";

export default function Setting(query: string, listItems: Item[]) {
  const prefix = ">";
  const action = query.split(prefix)[1]?.trim();
  const items = listItems;
  const builder = Builder(items, prefix, action);

  const systemCommands = async () => {
    await Promise.all([
      loginCmd(),
      logoutCmd(),
      deleteCacheCmd(),
      deleteDbCmd(),
      updateCmd(),
      activateAutoupdateCmd(),
      deactivateAutoupdateCmd(),
      helpCmd(),
      changelogCmd(),
    ]);

    return items;
  };

  const loginCmd = async () => {
    await builder.addItem({
      query,
      title: "login",
      subtitle: "Generate OAuth access token",
      arg:
        "URL:https://github.com/login/oauth/authorize?client_id=869cbedd6ed52af80986&scope=repo",
    });
  };

  const logoutCmd = async () => {
    await builder.addItem({
      query,
      title: "logout",
      subtitle: "Log out this workflow",
    });
  };

  const deleteCacheCmd = async () => {
    await builder.addItem({
      query,
      title: "delete cache",
      subtitle: "Delete GitHub Cache",
    });
  };

  const deleteDbCmd = async () => {
    await builder.addItem({
      query,
      title: "delete database",
      subtitle: "Delete database (contains login, config and cache)",
    });
  };

  const updateCmd = async () => {
    await builder.addItem({
      query,
      title: "update",
      subtitle: "There is an update for this Alfred workflow",
    });
  };

  const activateAutoupdateCmd = async () => {
    await builder.addItem({
      query,
      title: "activate autoupdate",
      subtitle: "Activate auto updating this Alfred Workflow",
    });
  };

  const deactivateAutoupdateCmd = async () => {
    await builder.addItem({
      query,
      title: "deactivate autoupdate",
      subtitle: "Deactivate auto updating this Alfred Workflow",
    });

    return items;
  };

  const helpCmd = async () => {
    await builder.addItem({
      query,
      title: "help",
      subtitle: "View the README",
      arg:
        "URL:  https://github.com/whomwah/alfred-github-workflow/blob/master/README.md",
    });
  };

  const changelogCmd = async () => {
    await builder.addItem({
      query,
      title: "changelog",
      subtitle: "View the CHANGELOG",
      arg:
        "URL:https://github.com/whomwah/alfred-github-workflow/blob/master/README.md",
    });
  };

  return {
    run: async () => await systemCommands(),
  };
}
