const rtr = require('express').Router()
const fs = require('fs');
const { google } = require('googleapis')

const Subscriptions = require('../model/subs')
const SheetData = require('../model/sheets')
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

rtr.route('/show/:subsid')
  .get((req, res) => {
    const subsId = req.params.subsid.toString()
    SheetData.find({ subscriptionId: subsId }, (err, subsList) => {
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

let temp_sheetAuth = null
function authorize(sheetCredentials, callback) {
  try {
    const { client_secret, client_id, redirect_uris } = sheetCredentials.web; // get credentials
    const oAuth2Client = new google.auth.OAuth2( // create and assign google oAuth2.0
      client_id, client_secret, redirect_uris[0]);
    const authUrl = oAuth2Client.generateAuthUrl({  // create oAuth URL to get drive access
      access_type: 'offline',
      scope: SCOPES,
    });
    temp_sheetAuth = oAuth2Client
    callback(authUrl)
  } catch (error) {
    if (error) console.log(error)
    callback(null)
  }
}

async function getSheetAccessToken(oAuth2Client, code, callback) {
  try {
    const getToken = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(getToken.tokens)
    callback(oAuth2Client)
  } catch (error) {
    if (error) console.log(error)
    callback(null)
  }
}

async function getSheetAccess(auth, sheetId, callback) {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    // const sheetRes = await sheets.spreadsheets.values.get({
    //   spreadsheetId: sheetId,
    //   range: "Form Responses 1",
    //   majorDimension: 'COLUMNS'
    // })
    const sheetRes = await sheets.spreadsheets.get({
      spreadsheetId: sheetId
    })
    console.log(sheetRes.data.sheets)
    callback([])
  } catch (error) {
    if (error) console.log('The API returned an error: ' + error);
    console.log('listfile erro')
    callback(null)
  }
}

let sheetId = null;

rtr.route('/add/:sheetId')
  .get((req, res) => {
    sheetId = req.params.sheetId
    fs.readFile(__dirname + '/credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      authorize(JSON.parse(content), sheetauthUri => {
        if (sheetauthUri) {
          res.json({
            status: 2, // goto url
            sheetAuthURL: sheetauthUri
          })
        } else {
          res.json({
            status: 1,
            sheetAuthURL: ''
          })
        }
      })
    })
  })
  .post((req, res) => {
    // const sheetId = "1joF6aR2W5-743gO-TvUUwZEejN7vuWkD4lQCzdKmin4"
    // const subscriptionId = "kartik9756@gmail.com"
    console.log("sheetId")
    console.log(sheetId)
    getSheetAccessToken(temp_sheetAuth, req.body.code, (auth) => {
      if (auth) {
        getSheetAccess(auth, sheetId, sheetData => {
          console.log(sheetData)
        })
      }
    })
  })

module.exports = rtr