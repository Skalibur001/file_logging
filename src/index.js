const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const fs=require('fs')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    let fName = '/home/saurabh/Documents/chat_socketIo/src/a.txt'
    let fNameStat = fs.statSync(fName);


    if (!fNameStat.isFile()) {
        console.log(fName + ' is not a file');
        process.exit(1);
    }

    console.log('watching ' + fName + ' bytes: ' + fNameStat.size);

    fs.watch(fName, function (event, filename) {
        let fNameStatChanged = fs.statSync(fName);
        console.log('file changed from ' + fNameStat.size + ' to ' + fNameStatChanged.size);

        fs.open(fName, 'r', function(err, fd) {
            let newDataLength = fNameStatChanged.size - fNameStat.size;
            let buffer = new Buffer(newDataLength);
            fs.read(fd, buffer, 0, newDataLength, fNameStat.size, function (err, bytesRead, newData) {
                if (err) {
                    console.log(err.message);
                }

                console.log(newData.toString());
                socket.emit('message',newData.toString())
            });
            fNameStat = fs.statSync(fName);
        });

    }); // fs.watch


    //welcome message



    socket.broadcast.emit('message',"a new user has joined")

    socket.on('sendMessage', (message) => {
        socket.broadcast.emit('message', message)
    })

    socket.on('disconnect',()=>{
        io.emit('leave','user left');
        })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})