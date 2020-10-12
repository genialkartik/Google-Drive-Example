const rtr = require('express').Router()
const fs = require('fs');
const { google } = require('googleapis');

const Subscriptions = require('../model/subs')
const SheetData = require('../model/sheets')

// If modifying these scopes, delete token.json.
const SCOPES = [
  'https://www.googleapis.com/auth/drive'
];

let temp_auth = null;

function authorize(credentials, callback) {
  try {
    const { client_secret, client_id, redirect_uris } = credentials.web; // get credentials
    const oAuth2Client = new google.auth.OAuth2( // create and assign google oAuth2.0
      client_id, client_secret, redirect_uris[0]);
    const authUrl = oAuth2Client.generateAuthUrl({  // create oAuth URL to get drive access
      access_type: 'offline',
      scope: SCOPES,
    });
    temp_auth = oAuth2Client
    callback(authUrl)
  } catch (error) {
    if (error) console.log(error)
    callback(null)
  }
}

async function getAuthAccessToken(oAuth2Client, code, callback) {
  try {
    const getToken = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(getToken.tokens)
    callback(oAuth2Client, getToken.tokens)
  } catch (error) {
    if (error) console.log(error)
    callback(null, null)
  }
}

async function listFiles(auth, token, callback) {
  try {
    let subscriptions = []
    const drive = google.drive({ version: 'v3', auth });
    const userdetail = await drive.about.get({ "fields": "user" })
    const newuser = userdetail.data.user
    const query = Subscriptions.find({ subscriptionId: newuser.emailAddress })
    const sub = await query.exec()
    if (sub.length) {
      console.log('subscription already exists')
    }
    else {
      console.log('created new subscription')
      subscriptions.push(newuser)
      const flist = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.spreadsheet'", // xlsx files only
        fields: 'nextPageToken, files(id, name, sheets)', // name and id of spreadsheets
      })
      const filesList = flist.data.files
      subscriptions.push(filesList)
      // Save credentials, token, and sheets in to Table (subscriptions)
      const newSub = new Subscriptions({
        authUser: 'genialkartik',
        subscriptionId: newuser.emailAddress,
        userDetails: newuser,
        token: token,
        sheetCount: filesList.length
      })
      newSub.save()
      // save sheets data into new Table (sheets)
      const newSheet = new SheetData({
        subscriptionId: newuser.emailAddress,
        sheets: filesList
      })
      newSheet.save()
      console.log('saved')
    }
    callback(subscriptions)
  } catch (error) {
    if (error) console.log('The API returned an error: ' + error);
    console.log('listfile erro')
    callback([])
  }
}

rtr.route('/add')
  .get((req, res) => {
    fs.readFile(__dirname + '/credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      authorize(JSON.parse(content), authUri => {
        if (authUri) {
          res.json({
            status: 2, // goto url
            authURL: authUri
          })
        } else {
          res.json({
            status: 1,
            authURL: ''
          })
        }
      });
    });
  })

rtr.route('/')
  .get((req, res) => {
    Subscriptions.find({ authUser: 'genialkartik' }, (err, subsList) => {
      if (subsList.length) {
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
  .post((req, res) => {
    if (temp_auth) {
      getAuthAccessToken(temp_auth, req.body.code, (auth, token) => {
        if (auth && token) {
          listFiles(auth, token, subs => {
            if (subs.length) {
              res.json({
                status: 3, // get file with auth
                msg: 'Success'
              })
            }
            else {
              console.log('keep trying')
              res.json({
                status: 2, // get file with auth
                msg: 'Something went wrong'
              })
            }
          })
        } else {
          res.json({
            status: 1, // get file with auth
            msg: 'Subscription already exists'
          })
        }
      })
    } else {
      res.json({
        status: 0,
        msg: 'Something went wrong'
      })
    }
  })

module.exports = rtr