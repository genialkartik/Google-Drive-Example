const rtr = require('express').Router()

rtr.route('/')
  .get((req, res) => {
    if (req.session.userdata) {
      res.json({
        status: 200,
        msg: 'Dashboard'
      })
    } else {
      res.json({
        status: 200, // change to 401
        msg: 'Login First'
      })
    }
  })

module.exports = rtr