module.exports = (socket, token, deviceInfo) => {
  auth.verify(token)
    .then(decoded => {
      db.members.findOne({ _id:decoded._id })
        .then(memberDoc => {
          if (memberDoc == null) {
            socket.emit('error', { name: 'NOT_FOUND', message: 'Member not found' })
            purgeSocket(socket)
          } else if (memberDoc.lastUuid && global.socketClients[memberDoc.lastUuid]) {
            socket.emit('error', { name: 'MULTIPLE_USAGE', message: 'Multiple usage detected. Request rejected' })

            purgeSocket(socket)
          } else {
            memberDoc.lastUuid = socket.uuid
            memberDoc.lastOnline = new Date()
            memberDoc.lastIP = socket.conn.remoteAddress
            memberDoc.startOnline = new Date()
            memberDoc.save()
              .then(memberDoc => {
                socket.clientInfo._id=memberDoc._id
                socket.clientInfo.username=memberDoc.username
                socket.clientInfo.lastPong=memberDoc.lastOnline
	              socket.clientInfo.IP=socket.conn.remoteAddress
                socket.subscribed = true
                socket.emit('subscribed', 'Subscription was successful')
              })
              .catch(err => socket.emit('error', err))
          }
        })
        .catch(err => {
          socket.emit('error', err)
        })
    })
    .catch(err => {
      socket.emit('error', err)
    })

}
