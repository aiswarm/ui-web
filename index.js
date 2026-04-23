/**
 * @typedef {Object} WebConfig
 * @property {number} port The port to listen on.
 */

import path from 'path'
import { promisify } from 'util'
import { fileURLToPath } from 'url'
import fs from 'fs'
import polka from 'polka'
import sirv from 'sirv'
import cors from 'cors'

const packageDir = path.dirname(fileURLToPath(import.meta.url))

export async function startServer(log, port = 3000) {
  const app = polka()

  // Enable CORS for map origins
  app.use(cors())

  /*
   * Serve static files from this package's `dist/`. Resolved relative to
   * this file rather than `process.cwd()` so launching the orchestrator
   * from any directory (workspace root, conductor/, a globally-installed
   * bin) finds the build.
   */
  const staticDir = path.join(packageDir, 'dist')
  if (!fs.existsSync(staticDir)) {
    throw new Error(
      `Could not find UI files at ${staticDir}; run 'npm run build' in the ui-web directory first.`
    )
  }
  app.use(sirv(staticDir))

  // Start the server
  const listen = promisify(app.listen).bind(app)
  await listen(port)

  log.info(`Web UI is available at http://localhost:${port}`)
}

/**
 * @param {API} api
 * @param {WebConfig} api.config.web The configuration object for the web server.
 */
export async function initialize(api) {
  const config = api.config.web ?? {}
  await startServer(api.log, config.port)
}
