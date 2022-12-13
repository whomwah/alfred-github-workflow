const DB_NAME = "github.sqlite";
const BUNDLE = "com.whomwah.alfred.github";
const DATA_DIR = `${
  Deno.env.get("HOME")
}/Library/Application Support/Alfred/Workflow Data/${BUNDLE}`;
const DB_DIR = `${DATA_DIR}/db`;
const DATABASE = `${DB_DIR}/${DB_NAME}`;
const STATE = "robotsonalfredworkflow";
const GITHUB_OAUTH_URL = "https://github.com/login/oauth/authorize";
const GITHUB_CLIENT_ID = "869cbedd6ed52af80986";
const OAUTH_URL =
  `${GITHUB_OAUTH_URL}?client_id=${GITHUB_CLIENT_ID}&scope=repo,gist&state=${STATE}`;

export { DATABASE, DB_DIR, OAUTH_URL };
