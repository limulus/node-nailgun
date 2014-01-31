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

/**
 * @fileoverview Smoke test for starting the server process.
 */

"use strict"

var NailgunServer = require("../src/NailgunServer.js")
  , assert = require("assert")
  , jvmpin = require("jvmpin")

var addr = "127.0.0.1"
  , port = 2335

describe("Smoke Test", function () {
    it("ensures a server is not already running and kills it if it is", function (done) {
        var connection = jvmpin.createConnection(port, addr)

        // If the server isn't running, we should get a connection
        // refused error.
        connection.on("error", function (err) {
            assert.strictEqual(err.code, "ECONNREFUSED")
            done()
        })

        // If there's a server already running, let's get it killed.
        connection.on("connect", function () {
            // Kill the existing Nailgun server process.
            connection.spawn("ng-stop", [])

            // Wait for connection close instead of process exit because
            // the Nailgun server is probably immediately shutting down.
            connection.on("close", function () {
                // To be on the safe side, try to wait for server to fully
                // exit before proceeding to next test.
                setTimeout(done, 500)
            })
        })
    })

    it("should successfully start the server", function (done) {
        var server = new NailgunServer(addr, port)

        // This should cause a new Nailgun server to start, assuming
        // killing any servers already running on the same port worked
        // in the above test. We're running the classpath shortcut 
        // because it's simple.
        server.spawn("ng-cp", [], function (err, proc) {
            assert.ifError(err)

            // Make sure we get some data from the classpath command.
            var dataReceived = false
            proc.stdout.on("data", function (buf) {
                dataReceived = true
            })

            var procExited = false
            proc.on("exit", function (exitCode) {
                // It's not yet clear why we get two exit events, but let's 
                // make sure we don't wind up calling done() twice
                if (procExited) return
                procExited = true

                // Make sure everything went as expected, then we're done!
                assert.equal(exitCode, 0)
                assert.ok(dataReceived)
                done()
            })
        })
    })

    it("should be able to set and get classpaths", function (done) {
        var server = new NailgunServer(addr, port)
        server.addClassPath("/foo/bar", function (err) {
            assert.ifError(err)
            server.getClassPaths(function (err, paths) {
                assert.ifError(err)
                assert.deepEqual(paths, [
                    NailgunServer._pathToNailgunJar(),
                    "/foo/bar"
                ])
                done()
            })
        })
    })

    it("should be able to stop the server.", function (done) {
        var server = new NailgunServer(addr, port)
        server.stop(function (err) {
            assert.ifError(err)
            
            var connection = jvmpin.createConnection(port, addr)
            connection.on("error", function () { done() })
            connection.on("connect", function () {
                assert.fail("Connected to stopped Nailgun server!?")
            })
        })
    })
})


