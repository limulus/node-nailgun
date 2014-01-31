/**
 * @license Copyright 2014 DesertNet, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict"

var EventEmitter = require("events").EventEmitter
  , NailgunServer = require("../src/NailgunServer.js")
  , inherits = require("util").inherits

/**
 * Emulate ChildProcess-like objects.
 * @constructor
 */
var NailgunChildProcessMock = module.exports = function () {
    EventEmitter.call(this)
    this.stdout = new EventEmitter()
    this.stdout.setEncoding = function () {}
}
inherits(NailgunChildProcessMock, EventEmitter)

/**
 * Emulates Nailgun's built-in "ng-cp" command, which returns
 * the classpath.
 * @param {Array.<string>=} extraPaths
 */
NailgunChildProcessMock.prototype.emulateNgCp = function (extraPaths) {
    var defaultClassPath = NailgunServer._pathToNailgunJar()
    var paths = [defaultClassPath].concat(extraPaths || [])

    setImmediate(function () {
        paths.forEach(function (path) {
            this.stdout.emit("data", "file:" + path + "\n")
        }.bind(this))
        setImmediate(function () {
            // Not sure why, but jvmpin tends to emit "close" twice
            // on the stdio streams and "exit" twice on the process.
            // It also never emits "end" on the streams.
            this.stdout.emit("close", false)
            this.stdout.emit("close", false)
            this.emit("exit", 0)
            this.emit("exit", 0)
        }.bind(this))
    }.bind(this))
}
