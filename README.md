node-nailgun   [![Build Status](https://travis-ci.org/DesertNet/node-nailgun.png?branch=master)](https://travis-ci.org/DesertNet/node-nailgun)
============

A Node.js module for starting, stopping and connecting to [Nailgun](http://martiansoftware.com/nailgun/) servers.


Synopsis
--------

Running Java command line utilities tends to be kinda slow. You run `java -jar foo.jar` and your JVM spends time spinning up. If the process is computationally expensive, the JVM spends lots of time compiling and optimizing bytecode. And then your process finishes and exits, leaving the next invocation of the command to do the same things all over again.

A better way is to run your command in a Nailgun server. The server stays running even when your command has finished. You still pay the JVM tax on first run, but subsequent runs should be considerably faster.


Caveats
-------

Please note that Nailgun is meant to run in a trusted environment. It runs as the system user that started it and its protocol makes no attempt to authenticate connections. Only run it on single-user workstations and on a local loopback address (like `127.0.0.1`).

Also note that some Java command line utilities may keep static variables in memory and make the assumption that these variables will be cleared between runs. This won’t happen in a Nailgun server, so be wary when trying out new utilities.


Installation
------------

```shell
npm install node-nailgun
```

There’s no need to independently install Nailgun…it’s included in the module!


Example
-------

Runs a simple command called `Hello`, that prints out “Hello” followed by the name given as the first command line argument. (See this module’s example directory.)

```javascript
var nailgun = require("node-nailgun")

var server = nailgun.createServer()
server.addClassPath(__dirname, function (error) {
    server.spawn("Hello", ["Casey"], function (error, helloProcess) {
        helloProcess.stdout.pipe(process.stdout)
    })
})
```

Functions
---------

### nailgun.createServer(address, port)

Instantiate a server instance. If `address` and `port` are omitted, the defaults of `"127.0.0.1"` and `2335` are used.

This does not actually start the server. This happens on demand, and only if the server is not already running.


### server.spawn(command, args, callback)

Runs the specified command with the given array of arguments. The callback is called once the command has started with the following arguments:

  * An error object if the command could not be started.
  * An object similar to `ChildProcess`, but is actually a `jvmpin`. See [jvmpin](https://npmjs.org/package/jvmpin) for more.


### server.addClassPath(path, callback)

Adds the `path` to the server’s classpath. The callback is called once complete, or if there was an error it will be passed the error object.


### server.getClassPaths(callback)

Fetches an array of paths in the server’s classpath. The callback is called with the following arguments:

  * An error object if fetching the classpath failed.
  * An array of path strings.


### server.stop(callback)

Stops the server. The callback is called when server shutdown is probably complete, or if there was an error it will be passed the error object.

