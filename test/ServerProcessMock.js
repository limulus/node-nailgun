/**
 * @license Copyright 2013 DesertNet, LLC
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

require("setimmediate")  // setImmediate shim for Node 0.8

var EventEmitter = require("events").EventEmitter
  , inherits = require("util").inherits


/**
 * Emulates a compiler child process.
 * @constructor
 * @inherits {EventEmitter}
 */
var ServerProcessMock = module.exports = function () {
    EventEmitter.call(this)
    this.stdout = new EventEmitter()
    this.stderr = new EventEmitter()
    this.stdin = new EventEmitter()
}
inherits(ServerProcessMock, EventEmitter)

ServerProcessMock.prototype.emulateServerStart = function () {
    setImmediate(function () {
        this.stdout
    }.bind(this))
}

/**
 * Emulate an error launching the process.
 */
ServerProcessMock.prototype.emulateSpawnError = function () {
    setImmediate(function () {
        var err = new Error("spawn ENOENT")
        err.code = err.errno = "ENOENT"
        err.syscall = "spawn"
        this.emit("error", err)
    }.bind(this))
}
