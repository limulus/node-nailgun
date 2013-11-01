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

var spawn = require("child_process").spawn
  , path = require("path")
  , jvmpin = require("jvmpin")

var NAILGUN_JAR = path.resolve(__dirname + "/../support/nailgun-0.7.1.jar")

/**
 * Representation of a Nailgun server.
 * @constructor
 * @param {string=} addr The IP address the server is available on.
 * @param {number=} port The TCP port the server is available on.
 */
var NailgunServer = module.exports = function (addr, port) {
    this._addr = addr || "127.0.0.1"
    this._port = port || 2113

    this._serverProc = null
    this._startCallback = null
    this._stdoutLog = ""
}

/**
 * Dependency injection point for spawning child processes.
 */
NailgunServer.prototype._doSpawn = function () {
    return spawn.apply(global, arguments)
}

/**
 * Start the server.
 * @param {function(Error?)} cb
 */
NailgunServer.prototype._start = function (cb) {
    var addrAndPort = this._addr + ":" + this._port
    var spawnOpts = {
        "detached": true
      , "stdio": ["ignore", "pipe", "ignore"]
    }
    this._serverProc = this._doSpawn("java", ["-jar", NAILGUN_JAR, addrAndPort], spawnOpts)
    this._serverProc.stdout.on("data", this._receiveServerStdout.bind(this))
    this._serverProc.on("close", this._receiveServerClose.bind(this))
    this._startCallback = cb
}

/**
 * Receives everything the nailgun server prints out and keeps track of the 
 * state of the server.
 * @param {string} name
 * @param {Buffer} data
 */
NailgunServer.prototype._receiveServerStdout = function (data) {
    if (data.toString().match(/^NGServer started on .+, port \d+/)) {
        // Give server some time to actually bind to the port before we
        // try to fire the callback.
        setTimeout(function () {
            var callback = this._startCallback
            this._startCallback = null
            if (callback) {
                callback(null)
                this._serverProc.stdout.removeAllListeners()
                this._serverProc.stdout.unref()
                this._serverProc.unref()
            }
        }.bind(this), 200)  
    }
    else {
        this._stdoutLog += data.toString()
    }
}

/**
 * Gets called when the server process ends, so we can call the start
 * callback with an error.
 */
NailgunServer.prototype._receiveServerClose = function () {
    var callback = this._startCallback
    if (callback) {
        var err = new Error("Nailgun failed to start up.")
        err.nailgunStdout = this._stdoutLog
        this._startCallback = null
        callback(err)
    }
}

/**
 * Run the specified command in the Nailgun server.
 * @public
 * @param command {string} The command to run on the Nailgun server.
 * @param args {Array.<string>} The argument list for the command.
 * @param cb {function(Error?, JVMPinProcess?)} Callback to receive spawned process object.
 */
NailgunServer.prototype.spawn = function (command, args, cb) {
    var connection = jvmpin.createConnection(this._port, this._addr, function () {
        var proc = this._spawnProcessFromNailgunConnection(connection, command, args)
        return cb(null, proc)
    }.bind(this))
    connection.on("error", function () {
        this._start(function (err) {
            if (err) return cb(err)

            var proc = this._spawnProcessFromNailgunConnection(connection, command, args)
            return cb(null, proc)
        }.bind(this))
    }.bind(this))
}

/**
 * @private
 * @param connection {JVMPin} The JVMPin object created via jvmpin.createConnection()
 * @param command {string} The command to run on the Nailgun server.
 * @param args {Array.<string>} The argument list for the command.
 * @return {JVMPinProcess} The spawned JVMPinProcess
 */
NailgunServer.prototype._spawnProcessFromNailgunConnection = function (connection, command, args) {
    var proc = connection.spawn(command)
    return proc
}

