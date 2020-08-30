const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const {genMsg} = require('./utils/messages')
const {addUser,getUser,getUsersInRoom,removeUser} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDir = path.join(__dirname, '../public')

app.use(express.static(publicDir))

//let count = 0

io.on('connection',(socket)=>{
    console.log("new connection!")

    socket.on('join',({username,room}, callback)=>{
        const {error,user} = addUser({id : socket.id, username,room})
        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('welcomeMsg',genMsg('Admin','Welcome!!'))
        socket.broadcast.to(user.room).emit('welcomeMsg',genMsg('Admin',`${user.username} has joined the room!`))
        io.to(user.room).emit('roomData',{
            room : user.room,
            users : getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendmsg',(message,callback)=>{
       const user = getUser(socket.id)
       io.to(user.room).emit('welcomeMsg',genMsg(user.username,message)) 
       callback('Delivered!')
       
    })

    socket.on('sendlocation',(coords,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMsg',`https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
        callback()
  
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        if (user){
            io.to(user.room).emit('welcomeMsg',genMsg('Admin',`${user.username} has been disconnected!!`))
            io.to(user.room).emit('roomData',{
                room : user.room,
                users : getUsersInRoom(user.room)
            })
        }
    })

    
    // socket.emit('countUpdated',count)

    // socket.on('increase',()=> {
    //     count++
    //     io.emit('countUpdated',count)
    // })
})

server.listen(port, () => {
    console.log(`Server is up and running at ${port}!`)
})

