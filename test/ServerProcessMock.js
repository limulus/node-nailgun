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
    this.stdout.unref = function () {}
}
inherits(ServerProcessMock, EventEmitter)

/**
 * Stub so we can be "unreferened".
 */
ServerProcessMock.prototype.unref = function () {}

/**
 * Emulates a successful server startup.
 */
ServerProcessMock.prototype.emulateServerStart = function () {
    setImmediate(function () {
        var buf = new Buffer("NGServer started on 127.0.0.1, port 2113\n")
        this.stdout.emit("data", buf)
    }.bind(this))
}

/**
 * Emulates an error launching the process.
 */
ServerProcessMock.prototype.emulateSpawnError = function () {
    setImmediate(function () {
        var err = new Error("spawn ENOENT")
        err.code = err.errno = "ENOENT"
        err.syscall = "spawn"
        this.emit("error", err)
    }.bind(this))
}

/**
 * Emulates when nailgun fails to bind to a port.
 */
ServerProcessMock.prototype.emulateServerFailedStart = function () {
    var chunks = [
        {"stdout":"NGServer started on all interfaces, port 2113.\n"}
      , {"stdout":"com.martiansoftware.nailgun.builtins.NGAlias: 0/0\n"}
      , {"stdout":"com.martiansoftware.nailgun.builtins.NGClasspath: 0/0\ncom.martiansoftware.nailgun.builtins.NGServerStats: 0/0\ncom.martiansoftware.nailgun.builtins.NGStop: 0/0\ncom.martiansoftware.nailgun.builtins.NGVersion: 0/0\n"}
      , {"stdout":"NGServer shut down."}
      , {"stdout":"\n"}
    ]

    chunks.forEach(function (chunk) {
        setImmediate(function () {
            this.stdout.emit("data", new Buffer(chunk["stdout"]))
        }.bind(this))
    }.bind(this))

    setImmediate(function () {
        this.stdout.emit("end")
        this.stdout.emit("finish")
        this.stdout.emit("close", false)
        this.emit("close", 0)
    }.bind(this))
}
