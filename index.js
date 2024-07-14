// Imports
const express = require("express");
const HashMap = require('hashmap');
const {
    Worker,
    isMainThread,
    parentPort,
    workerData,
    postMessage
} = require('worker_threads');
const app = express();
const http = require('http').createServer(app);
const io = require("socket.io")(http, {
    cors: {
        origin: "*"
    }
});

// Variable && Functions
let amountOfMessage = new HashMap();
let serverList = [];
let worker = new Worker('./worker.js', {
    workerData
});
const threads = new Set();

// Handle Worker Thread
worker.on("message", (newval) => {
    amountOfMessage.copy(newval);
});

// Handle Socket Connection
io.on("connection", (socket) => {
    socket.on("username", (user) => {
        // Check Duplicate Browser
        let username = user;
        let browserSame = false

        serverList.forEach((user, x) => {
            if (user == username) {
                io.to(socket.id).emit('duplicateBrowse');
                browserSame = true;
            }
        });

        // Update server list && Start Rate Limiter
        if (!browserSame) {
            if (!amountOfMessage.get(username)) {
                amountOfMessage.set(username, 0)
            };

            serverList.push(username);

            if (threads.size == 0) {
                if (serverList.length >= 1) {
                    worker.postMessage([amountOfMessage, serverList, "startUp"]);
                    threads.add(worker);
                }
            }

            io.emit("updateServerList", serverList);
        }


        // Handle message
        socket.on("message", (msg) => {
            serverList.map((user) => {
                if (user == username) {
                    if (amountOfMessage.get(username) < 20) {
						setTimeout(() => {
							let x = amountOfMessage.get(username);
							io.emit("receieve-msg", msg, username);
							amountOfMessage.set(username, (x + 1));
						}, 100);
                    } else {
                        worker.postMessage([amountOfMessage, username, "setCoolDown"]);
                        io.to(socket.id).emit('blocked');
                    }
                }
            });
        });

        // Handle client disconnecting
        socket.on("disconnect", () => {
            serverList.map((user, x) => {
                if (user == username) {
                    const index = serverList.indexOf(username);
                    if (index > -1) {
                        serverList.splice(index, 1);

                        if (serverList.length == 0) {
                            for (worker in threads) {
                                threads.delete(worker);
                            }
                        }
                    }
                }
            });

            // Update Serverlist
            console.log(serverList);
            io.emit("updateServerList", serverList);
        });
    });
});

let port = process.env.PORT || 4000;
http.listen(port);
