# This can be removed after https://github.com/npm/npm/issues/5875 is fixed.
try
  {Adapter,TextMessage,EnterMessage,LeaveMessage,User} = require 'hubot'
catch
  prequire = require('parent-require')
  {Adapter,TextMessage,EnterMessage,LeaveMessage,User} = prequire 'hubot'

WebSocket = require('ws')
uuid = require('uuid/v4')

class WebsocketAdapter extends Adapter
  send: (envelope, strings...) ->
    @robot.logger.debug "send", envelope, strings
    try
       envelope.room.send str for str in strings
    catch e
       if e.message.match /not opened/i
         envelope.room.close

  reply: (envelope, strings...) ->
    @robot.logger.debug "reply", envelope, strings
    envelope.room.send str for str in strings

  run: ->
    port = if process.env.HUBOT_WEBSOCKET_PORT then process.env.HUBOT_WEBSOCKET_PORT else 8081

    server = new WebSocket.Server port: port

    server.on "connection", (socket) =>
      user = new User uuid(), room: socket
      @receive new EnterMessage(user)
      @robot.logger.debug "Enter: %s", user.id
      @robot.brain.set(user.id, socket.upgradeReq.headers.cookie)

      socket.on "message", (msg) =>
        @robot.logger.debug "Message[%s]: %s", user.id, msg
        @receive new TextMessage(user, msg)
      socket.on "error", (err) =>
        console.log("Error happunud", err)
      socket.on "close", () =>
        @receive new LeaveMessage(user)
        @robot.brain.remove(user.id)

    @robot.logger.info "Running websocket server on port %s", port
    @emit 'connected'

# Export class for unit tests
module.exports = WebsocketAdapter
