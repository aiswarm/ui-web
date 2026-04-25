/**
 * @typedef {Object} WebConfig
 * @property {number} port The port to listen on.
 */

import path from 'path'
import http from 'http'
import { fileURLToPath } from 'url'
import fs from 'fs'
import sirv from 'sirv'

const packageDir = path.dirname(fileURLToPath(import.meta.url))

export async function startServer(log, port = 3000) {
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

  /*
   * sirv returns a (req, res, next) handler compatible with node:http.
   * single-page-app fallback so client-side routes resolve to index.html.
   */
  const serve = sirv(staticDir, { single: true })
  const server = http.createServer((req, res) => {
    serve(req, res, () => {
      res.statusCode = 404
      res.end('Not found')
    })
  })

  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, () => {
      server.off('error', reject)
      resolve()
    })
  })

  log.info(`Web UI is available at http://localhost:${port}`)
  return server
}

/**
 * @param {API} api
 * @param {WebConfig} api.config.web The configuration object for the web server.
 */
export async function initialize(api) {
  const config = api.config.web ?? {}
  await startServer(api.log, config.port)
}
