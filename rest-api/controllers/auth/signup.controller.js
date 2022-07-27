module.exports = (req) => new Promise((resolve, reject) => {
	if(req.method == 'POST') {
		let IP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || ''

		let formdata = {
			username: req.body.username || ''

		}

		if(formdata.username.trim() == '')
			return reject({  name: 'USERNAME_EMPTY', message: 'Username required' })

		db.members.findOne({ username: formdata.username })
			.then(doc => {
				if(doc != null) {
					// if(doc.verified)
					// 	return reject({  name: 'USER_EXISTS', message: 'Kullanici zaten kayitli.' })

					doc.authCode = util.randomNumber(1200, 9980).toString()
          doc.authCodeExpire = (new Date()).add('minute',1)
					spamCheck(doc)
						.then(doc => {
							doc.save()
							sender.sendAuthCode(doc.username, doc.authCode)
								.then(resolve)
								.catch(reject)
						})
						.catch(reject)
				} else {
					signup(formdata)
						.then(resolve)
						.catch(reject)
				}
			})
	} else {
		restError.method(req, reject)
	}
})


function signup(formdata) {
	return new Promise((resolve, reject) => {
		let authCode = util.randomNumber(1200, 9980).toString()
		if(!(util.validEmail(formdata.username) || util.validTelephone(formdata.username))) {
			return reject({  name: 'USERNAME_WRONG', message: 'Incorrect username' })
		}
		let newmember = new db.members({
			username: formdata.username,
			// password: formdata.password,
			authCode: authCode,
      authCodeExpire : (new Date()).add('minute',1)
		})

		newmember.save()
			.then(newDoc => {
				sender.sendAuthCode(newDoc.username, newDoc.authCode)
					.then(resolve)
					.catch(reject)
			})
			.catch(reject)

	})
}