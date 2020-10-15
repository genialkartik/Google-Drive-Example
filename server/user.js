const rtr = require('express').Router()
const User = require('../model/user')

rtr.route('/login')
  .get((req, res) => {
    if (req.session.userdata) {
      res.json({
        status: 1,
        msg: 'Already Logged In'
      })
    } else {
      res.json({
        status: 0,
        msg: 'Loging In'
      })
    }
  })
  .post((req, res) => {
    // data from signin form
    const { uname, upwd } = req.body
    User.findOne({ username: uname }, (err, user) => {
      if (user || err && user.password === upwd) {
        req.session.userdata = {
          username: user.username,
          name: user.name,
          redir: null
        }
        res.json({
          status: 200,
          msg: 'Logged In Successfully',
          user: req.session.userdata
        })
      }
      else {
        res.json({
          status: 201,
          msg: "Wrong Credentials",
          user: {}
        })
      }
    })
  })

rtr.route('/signup')
  .get((req, res) => {
    res.json({
      status: 200,
      msg: 'Signing In'
    })
  })
  .post((req, res) => {
    // data from signup form
    const { uname, username, upwd } = req.body
    User.findOne({ username: username }, (err, user) => {
      if (user || err) {
        res.json({
          status: 201,
          msg: "Username already exist!",
          user: {}
        })
      }
      else {
        const newUser = new User({
          username: username,
          name: uname,
          password: upwd
        })
        newUser.save()
          .then((item) => {
            if (item) {
              req.session.userdata = {
                username: item.username,
                name: item.name,
                redir: null
              }
              res.json({
                status: 200,
                msg: 'Signed Up successfully',
                user: req.session.userdata
              })
            } else {
              res.json({
                status: 201,
                msg: "Something went Wrong!",
                user: {}
              })
            }
          })
      }
    })
  })

rtr.route('/logout')
  .get((req, res) => {
    if (req.session.userdata) {
      req.session.destroy(function () {
      });
    }
    res.json({
      status: 1,
      msg: 'Logged Out Succesfully'
    })
  });

module.exports = rtr