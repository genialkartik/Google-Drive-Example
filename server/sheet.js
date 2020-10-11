const rtr = require('express').Router()
const fs = require('fs');
const { google } = require('googleapis');

const SheetData = require('../model/sheets')


rtr.route('/show/:subsid')
  .get((req, res) => {
    const subsId = req.params.subsid.toString()
    console.log(subsId)
    SheetData.find({ subscriptionId: subsId }, (err, subsList) => {
      console.log(subsList)
      if (subsList) {
        res.json({
          status: 200,
          subfiles: subsList
        })
      } else {
        res.json({
          status: 200,
          subfiles: []
        })
      }
    })
  })

module.exports = rtr