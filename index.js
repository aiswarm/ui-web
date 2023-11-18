/**
 * @typedef {Object} WebConfig
 * @property {number} port The port to listen on.
 */

import path from "path";
import polka from "polka";
import sirv from "sirv";
import cors from "cors";
import { promisify } from "util";
import fs from "fs";

export async function startServer(log, port = 3000) {
  const app = polka();

  // Enable CORS for all origins
  app.use(cors());

  // Serve static files from the specified directory
  const staticDir = path.join(process.cwd(), "/plugins/ui-web/dist");
  if (!fs.existsSync(staticDir)) {
    throw new Error(
      `Could not find UI files, please run 'npm run build' in the ui-web directory first.`
    );
  }
  app.use(sirv(staticDir));

  // Start the server
  const listen = promisify(app.listen).bind(app);
  await listen(port);

  log.info(`Web UI is available at http://localhost:${port}`);
}

/**
 * @param {API} api
 * @param {WebConfig} api.config.web The configuration object for the web server.
 */
export function initialize(api) {
  const config = api.config.web ?? {};
  startServer(api.log, config.port).catch((err) => {
    api.log.error(err);
    process.exit(1);
  });
}
