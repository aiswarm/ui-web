/**
 * @typedef {Object} WebConfig
 * @property {number} port The port to listen on.
 */

import path from 'path'
import polka from 'polka'
import sirv from 'sirv'
import cors from 'cors'
import {promisify} from 'util'
import fs from 'fs'
import {execSync} from 'child_process'

export async function startServer(log, port = 3000) {
  const app = polka()

  // Enable CORS for map origins
  app.use(cors())

  // Serve static files from the specified directory
  const staticLocalDir = path.join(process.cwd(), 'node_modules/@aiswarm/ui-web/dist')
  if (fs.existsSync(staticLocalDir)) {
    app.use(sirv(staticLocalDir))
  } else {
    log.trace('Could not find local UI files, looking in global node_modules directory.')
    const staticGlobalDir = path.join(getGlobalNodeModulesPath(log), '@aiswarm/ui-web/dist')
    if (fs.existsSync(staticGlobalDir)) {
      app.use(sirv(staticGlobalDir))
    } else {
      throw new Error(
        'Could not find UI files, please run \'npm run build\' in the ui-web directory first.'
      )
    }
  }

  // Start the server
  const listen = promisify(app.listen).bind(app)
  await listen(port)

  log.info(`Web UI is available at http://localhost:${port}`)
}

function getGlobalNodeModulesPath(log) {
  try {
    return execSync('npm root -g').toString().trim()
  } catch (error) {
    log.debug('Error getting global node_modules directory:', error)
  }
}

/**
 * @param {API} api
 * @param {WebConfig} api.config.web The configuration object for the web server.
 */
export function initialize(api) {
  const config = api.config.web ?? {}
  startServer(api.log, config.port).catch((err) => {
    api.log.error(err)
    throw new Error(err)
  })
}
