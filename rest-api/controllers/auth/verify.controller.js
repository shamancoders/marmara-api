module.exports = (req) => new Promise((resolve, reject) => {
	if(req.method == 'POST') {
		// let IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || ''

		let username = req.body.username || req.query.username || ''
		let authCode = req.body.authCode || req.query.authCode || ''
		let deviceInfo = JSON.stringify(req.body.deviceInfo || req.query.deviceInfo || '')
		authCode = authCode.replaceAll(' ', '')

		if(username.trim() == '')
			return reject({  name: 'USERNAME_EMPTY', message: 'Username required' })

		db.members.findOne({ username: username })
			.then(doc => {
				if(dbnull(doc, reject)) {
					if(doc.authCode == authCode) {
            if((new Date()).getTime()<doc.authCodeExpire.getTime()){

            
						doc.verified = true
            doc.deviceInfo=deviceInfo
						spamCheck(doc)
							.then(doc => {
								doc.save()
								.then(newDoc => {
										let userInfo = {
											_id: doc._id,
											username: doc.username,
											role: doc.role,
                      deviceInfo:deviceInfo
										}

										let token = auth.sign(userInfo)

										resolve({ username: doc.username, role: doc.role, token: token })
								})
								.catch(reject)
							})
							.catch(reject)
            }else{
              reject({  name: 'AUTH_CODE_EXPIRED', message: 'Auth code expired' })
            }
					} else {
						reject({  name: 'AUTH_CODE', message: 'Incorrect auth code' })
					}
				}
			})
			.catch(reject)

	} else {
		restError.method(req, reject)
	}
})