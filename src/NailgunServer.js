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

	this.setChildProcessSpawnFunction(spawn)
}

/**
 * Dependency injection for spawning child processes.
 * @param {function(string, Array.<string>, Object.<string,*>)=ChildProcess} spawnFunc
 */
NailgunServer.prototype.setChildProcessSpawnFunction = function (spawnFunc) {
	this._spawnFunction = spawnFunc
}

/**
 * Start the server.
 */
NailgunServer.prototype.start = function () {
	var addrAndPort = this._addr + ":" + this._port
	  , spawnOpts = { "detached": true }
	this._spawnFunction("java", ["-jar", NAILGUN_JAR, addrAndPort], spawnOpts)
}
