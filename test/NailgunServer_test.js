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

var NailgunServer = require("../src/NailgunServer.js")
  , ServerProcessMock = require("./ServerProcessMock.js")
  , assert = require("assert")
  , sinon = require("sinon")
  , path = require("path")

var server, addr, port, procMock, spawner
beforeEach(function () {
	addr = "127.0.0.1"
	port = 2113
	server = new NailgunServer(addr, port)
	procMock = new ServerProcessMock()
    spawner = sinon.expectation.create("serverSpawner").returns(procMock)
	server._setChildProcessSpawnFunction(spawner)
})

describe("NailgunServer", function () {
	describe(".prototype._start", function () {
		it("should call the spawn function with args to run the nailgun server", function (done) {
			var jarpath = path.resolve(__dirname + "/../support/nailgun-0.7.1.jar")
			procMock.emulateServerStart()
			server._start(function (err) {
				assert.ifError(err)
				assert.ok(spawner.calledWith(
					"java"
				  , ["-jar", jarpath, addr+":"+port]
				  , {"detached": true, "stdio": ["ignore", "pipe", "ignore"]}
				))
				done()
			})
		})

		it("should call the callback when the server is started", function (done) {
			procMock.emulateServerStart()
			server._start(function (err) {
				done()
			})
		})

		it("should call the callback with an error when startup has failed", function (done) {
			procMock.emulateServerFailedStart()
			server._start(function (err) {
				assert.ok(err)
				done()
			})
		})
	})
})

