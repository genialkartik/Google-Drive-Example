const rtr = require('express').Router()

const StoredSheet = require('../model/sheetsStored')

rtr.route('/')
  .get((req, res) => {
    if (req.session.userdata) {
    StoredSheet.find({}, (err, sheetsData) => {
      if (sheetsData.length) {
        res.json({
          status: 2,
          msg: 'Dashboard',
          sheetsData: sheetsData
        })
      } else {
        res.json({
          status: 1,
          msg: 'Dashboard',
          sheetsData: []
        })
      }
    })
    } else {
      res.json({
        status: 0, // change to 401
        msg: 'Login First'
      })
    }
  })

module.exports = rtr