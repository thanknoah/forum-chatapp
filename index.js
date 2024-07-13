var express = require("express");
const { Worker, isMainThread, parentPort, workerData, postMessage } = require('worker_threads');
var app = express();
var http = require('http').createServer(app);
var io = require("socket.io")(http, {
    cors: { origin: "*" }
});


// Variable && Functions
let amountOfMessage = [];
let serverList = [];
let worker = new Worker('./worker.js', { workerData });
const threads = new Set();;

// Event handler
worker.on("message", e => {
    amountOfMessage = e;
});


// Socket Connection Handler
io.on("connection", (socket) => {
     // Setting Username
     socket.on("username", (user) => {
         let username = user; 
          
         const returnUsername = () => {
            return user;
         }

         // Check Duplicate Browser

         let browserSame = false
         serverList.forEach((user, x) => {
             if (user == username) {
                io.to(socket.id).emit('duplicateBrowse');
                browserSame = true;
             }
         });

         if (browserSame) {
            serverList.push(username);
            amountOfMessage.push(0);
 
             console.log(serverList);
 
             // Start Rate limiter
             if (threads.size == 0) {
               if (serverList.length >= 1) {
                   worker.postMessage(amountOfMessage);
                   threads.add(worker);
               }
             }
 
             io.emit("updateServerList", serverList);
         }
    

         socket.on("message", (msg) => {
            serverList.map((user) => {
                if (user == username) {
                   let x = serverList.indexOf(username);
                   amountOfMessage[x] += 1;

                   if (amountOfMessage[x] < 20) {
                      io.emit("receieve-msg", msg, username);
                   } else {
                      io.to(socket.id).emit('blocked');
                   }
                }
            });
         });
 
         socket.on("disconnect", () => {
            serverList.map((user, x) => {
                if (user == username) {
                   const index = serverList.indexOf(username);
                   if (index > -1) { 
                       serverList.splice(index, 1);
                       amountOfMessage.splice(index, 1);

                       if (serverList.length == 0) {
                          for (worker in threads) {
                              threads.delete(worker);
                              console.log("Deleted Thread");
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
