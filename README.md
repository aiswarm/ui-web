[![npm version](https://badge.fury.io/js/%40aiswarm%2Fui-web.svg)](https://badge.fury.io/js/%40aiswarm%2Fui-web)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Downloads](https://img.shields.io/npm/dm/%40aiswarm%2Fui-web.svg)](https://npmjs.com/package/%40aiswarm%2Fui-web)
[![Issues](https://img.shields.io/github/issues-raw/aiswarm/ui-web)](https://github.com/aiswarm/ui-web/issues)
[![Known Vulnerabilities](https://snyk.io/test/github/aiswarm/ui-web/badge.svg)](https://snyk.io/test/github/aiswarm/ui-web)
# AI Swarm - UI-Web

This is the web interface for the AI Swarm. It provides a way to monitor and interact with the agents and skills in the swarm.
This project is a plugin that relies on other components of the AI Swarm to be installed and running, it does not work on its own.

To get started with the AI Swarm, check out the [Conductor](https://github.com/aiswarm/conductor) project.

## Project setup for development

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

## Recommended Setup for development with other plugins

You will need to link the plugin to the other plugins you want to use. So that you can make changes and see them immediately without having to publish the plugin to npm.

For this I recommend you create a new folder for the AI Swarm and clone all the plugins you want to use into it. Then link them together.

Each plugin has `link` script defined in the `package.json` file if there are dependencies on other packages.
You can run it with `npm run link` to link your code directly when you make changes.