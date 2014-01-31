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

NailgunChildProcessMock.prototype.emulateNgCp = function () {
    var classpath = "file:" + NailgunServer._pathToNailgunJar()
    setImmediate(function () {
        this.stdout.emit("data", classpath + "\n")
        setImmediate(function () {
            this.stdout.emit("end")
            this.stdout.emit("finish")
            this.stdout.emit("close", false)
            this.emit("close", 0)
        }.bind(this))
    }.bind(this))
}
