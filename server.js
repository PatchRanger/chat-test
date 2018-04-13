var app = require('http').createServer(handler)
var io = require('socket.io')(app, { transports: ['websocket'] });
var fs = require('fs');

app.listen(8090);

function handler (req, res) {
  var filePath = req.url;

  if (req.url === '/') filePath = '/app/index.html';

  fs.readFile(__dirname + filePath, function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading' + filePath + ': ' + err);
    }

    res.writeHead(200);
    res.end(data);
  });
}
/* @todo Review & remove.
io.on('connection', function (socket) {
  setInterval(function(){
    socket.emit('news', 'Hello React Socket IO.');
  }, 2000);
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

console.log('server started at 8090');
*/
let uuid = require('uuid');
let p = require('./protocol');
let users = [];

io.on('connection', (ws) => {
    let me = {
        id:         uuid.v4(),
        client:     ws,
        nickname:   null,
        joinedAt:   new Date().getTime()
    }
    users.push(me)

    broadcast(
        p.MESSAGE_USER_JOINS,
        {
            id: me.id,
            nickname: me.nickname,
            joinedAt: me.joinedAt
        })
    sendUserList(ws)

    ws.send(JSON.stringify({
        type: p.MESSAGE_WHO_ARE_YOU,
        data: null
    }))

    ws.on('close', () => {
        removeSocket(ws)
        broadcast(
            p.MESSAGE_USER_LEAVES,
            {
                id: me.id
            }
        )
        return
    })

    ws.on('message', (m) => {
        let decoded = JSON.parse(m)

        if(decoded.type === p.MESSAGE_CHAT) {
            if(!decoded.data.message.length || !me.nickname)
                return;

            broadcast(p.MESSAGE_CHAT, {
                message:    filterUserInput(decoded.data.message),
                timestamp:  new Date().getTime(),
                from:       me.nickname,
                id:         uuid.v4()
            })
            return
        }

        if(decoded.type === p.MESSAGE_CHECK_NICKNAME) {
            if(decoded.data.nickname.length < 3) {
                ws.send(JSON.stringify({
                    type: p.MESSAGE_NAME_TOO_SHORT,
                    data: null
                }))

                return
            }

            if(decoded.data.nickname.length > 14) {
                ws.send(JSON.stringify({
                    type: p.MESSAGE_NAME_TOO_LONG,
                    data: null
                }))

                return
            }

            if(users.filter(u => u.nickname == decoded.data.nickname).length) {
                ws.send(JSON.stringify({
                    type: p.MESSAGE_NAME_IN_USE,
                    data: null
                }))

                return
            }

            ws.send(JSON.stringify({
                type: p.MESSAGE_NICKNAME_VALID,
                data: null
            }))
            return
        }

        if(decoded.type === p.MESSAGE_REQUEST_NICKNAME) {
            if(decoded.data.nickname.length < 3) {
                return
            }
            if(decoded.data.nickname.length > 14) {
                return
            }
            if(users.filter(u => u.nickname == decoded.data.nickname).length) {
                return
            }

            ws.send(JSON.stringify({
                type: p.MESSAGE_NICKNAME_GRANTED,
                data: {nickname: decoded.data.nickname}
            }))

            getUserBySocket(ws).nickname = decoded.data.nickname
            broadcast(
                p.MESSAGE_USER_STATE_CHANGE,
                {
                    id: me.id,
                    nickname: decoded.data.nickname
                })

            broadcast(
                p.MESSAGE_SERVER_MESSAGE,
                {
                    message: `${decoded.data.nickname} has joined the room.`
                }
            )
        }
    })
})
