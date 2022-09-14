// @ts-check
/// <reference no-default-lib="true" />
/// <reference lib="deno.worker" />

import { serve, ServeInit } from "https://deno.land/std@0.155.0/http/server.ts";

self.onmessage = async (e: MessageEvent) => {
  const serverOptions: ServeInit = e.data;
  serverOptions.onListen = () => null;

  function handler(req: Request): Response {
    const url = new URL(req.url);
    const params = url.searchParams;
    const access_token = params.get("access_token");
    const error = params.get("error");
    const errorDescription = params.get("error_description");
    const errorUri = params.get("error_uri");
    const THANKS = `<body>
        <h2>Alfred Github Workflow</h2>
        <h3>Thank you!</h3>
        <p>Your github access token [${access_token}] has been saved!. You can now close this window and start using the workflow.</p>
      </body>
    `;
    const errorMessage = `<body>
        <h2>Alfred Github Workflow</h2>
        <h3>${error}: ${errorDescription}</h3>
        <p><a href="${errorUri}">More information</a></p>
        <p>DISCLAIMER: I have no interest in your data. The access is purely for the workflow.</p>
      </body>
    `;

    // Send back the access code
    self.postMessage(access_token);

    // Close the server once the request has been sent to the browser
    setTimeout(() => {
      self.close();
    }, 1000);

    let resp: Response;
    if (error) {
      resp = new Response(errorMessage);
    } else {
      resp = new Response(THANKS);
    }
    resp.headers.set("Content-Type", "text/html");

    return resp;
  }

  // Force close the worker after 30 seconds as a backup to stop any future commands
  // get blocked by a previous request. The user should have confirmed or denied by
  // now and if they haven't they can always try again.
  setTimeout(() => {
    self.postMessage("Closing auth server as 30 seconds has passed.");
    self.close();
  }, 30000);

  await serve(handler, serverOptions);
};
