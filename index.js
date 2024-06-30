var express = require("express");
var app = express();
var http = require('http').createServer(app);
var io = require("socket.io")(http, {
    cors: { origin: "*" }
});

let serverList = []

io.on("connection", (socket) => {
     socket.on("username", (user) => {
         let username = user;
         serverList.push(username);

         console.log(serverList);

         io.emit("updateServerList", serverList);
          
         socket.on("message", (msg) => {
            io.emit("receieve-msg", msg, username)
        });

        socket.on("disconnect", () => {
            serverList.map((user, x) => {
                if (user == username) {
                   const index = serverList.indexOf(username);
                   if (index > -1) { 
                       serverList.splice(index, 1);
                   }
                }
            });

            console.log(serverList);
            io.emit("updateServerList", serverList);
        });
     });
});

http.listen(8080);