const DB_NAME = "github.sqlite";
const BUNDLE = "com.whomwah.alfred.github.1";
const HOME_DIR = Deno.env.get("HOME");
const DATA_DIR =
  `${HOME_DIR}/Library/Application Support/Alfred/Workflow Data/${BUNDLE}`;
const DB_DIR = `${DATA_DIR}/db`;
const DATABASE = `${DB_DIR}/${DB_NAME}`;
const STATE = "robotsonghalfredworkflow";
const GITHUB_OAUTH_URL = "https://github.com/login/oauth/authorize";
const GITHUB_CLIENT_ID = "869cbedd6ed52af80986";
const OAUTH_URL =
  `${GITHUB_OAUTH_URL}?client_id=${GITHUB_CLIENT_ID}&scope=repo&state=${STATE}`;
const INVALIDATE_CACHE_DATE = new Date().getTime() -
  1000 * 60 * 60 * 24 * 14; // 14 days

export { DATABASE, DB_DIR, INVALIDATE_CACHE_DATE, OAUTH_URL };
