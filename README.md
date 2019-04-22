# Repeato Test Automator

Repeato is supposed to be a simple and intuitive solution for test a replaying user interactions on an android device.

### Under the hood

It uses [miniCap](https://github.com/openstf/minicap/) to get a video stream from the test device and [miniTouch](https://github.com/openstf/minitouch) for sending input to the test device.
For image processing OpenCv is used.

### Installation

_Never tried to re-install everything from scratch. Please update this how-to if you are going through this_

The OpenCv installation (npm: `opencv4nodejs`) depends on `cmake`. Make sure it is installed globally in your PATH before running `npm install`.

1. `git submodule init`
2. `git submodule update`
3. `npm install`
4. `npm run electron-rebuild`

### Running in development mode

1. `npm run start-electron`
2. `npm run start-dev`

### Packaging the application

We use electron-builder to do that. Just run
`npm run dist` -> webpack will compile all sources to the `static` dir and then electron builder will export the application to `dist` dir

### Project Guide

#### Persisted Store Versioning

You might run into the situation where an app is already running in production and you would like to alter its data-model implementation.

Now, since repeato is using a persistent storage that is saved between application runtimes it can happen that the model that has been persisted to the users device storage on his last usage instance is now outdated and unfit to hydrate the initial state of the application during boot-up.

To circumvent this, the following mechanism is implemented:

- on store creation a store-version is saved to the users device storage
- every time the persisted store is being accessed to hydrate the application's initial state this stored store-version is checked against the version specified a config file
- on version inconsistency detection the persisted store will go through a series of migrations before being instanced as the initial store of the app

This migration happens as follows:

- there is a function defined for every migration from version x to version x + 1
- these functions are stored in an array
- a portion of this array representing oldVersion -> currentVersion is chunked out of the entire migration-function-array and applied one-by-one to the persisted store until it reaches the format the current store implementation demands
