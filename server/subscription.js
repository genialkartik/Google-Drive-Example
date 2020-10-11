const rtr = require('express').Router()
const fs = require('fs');
const { google } = require('googleapis');


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata'];
const TOKEN_PATH = 'token.json';

let temp_auth;
let tempToken = 0;
let token_flag = 0;

function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.web; // get credentials
  const oAuth2Client = new google.auth.OAuth2( // create and assign google oAuth2.0
    client_id, client_secret, redirect_uris[0]);
  if (token_flag == 0) {
    return getAccessToken(oAuth2Client, callback);
  } else {
    callback(temp_auth, 0);
  }
}

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({  // create oAuth URL to get drive access
    access_type: 'offline',
    scope: SCOPES,
  });
  temp_auth = oAuth2Client
  callback(authUrl, 1)
}

async function getAuthAccessToken(oAuth2Client, code, callback) {
  try {
    const getToken = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(getToken.tokens)
    tempToken = getToken.tokens;
    token_flag = 1;
    callback(oAuth2Client, 1)
  } catch (error) {
    if (error) console.log(error)
    callback(null, 0)
  }
}

async function listFiles(auth, callback) {
  try {
    let subscriptions = []
    const drive = google.drive({ version: 'v3', auth });
    const userdetail = await drive.about.get({ "fields": "user" })
    subscriptions.push(userdetail.data.user)
    const flist = await drive.files.list({
      q: "mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'", // xlsx files only
      fields: 'nextPageToken, files(id, name)', // name and id of spreadsheets
    })
    subscriptions.push(flist.data.files)
    callback(subscriptions, 1)
  } catch (error) {
    if (error) console.log('The API returned an error: ' + error);
    console.log('listfile erro')
    callback([], 0)
  }
}

rtr.route('/add')
  .get((req, res) => {
    // Load client secrets from a local file.
    fs.readFile(__dirname + '/credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Drive API.
      authorize(JSON.parse(content), (authcb, acb) => {
        if (acb == 0) {
          listFiles(authcb, (subs, cbb) => {
            console.log("subs")
            console.log(subs)
            if (cbb == 1) {
              res.json({
                status: 1, // token
                files: 'success'
              })
            }
            else {
              res.json({
                status: 1, // token
                files: 'failed'
              })
            }
          })
        } else {
          console.log('goto Url')
          res.json({
            status: 2, // goto url
            files: 'goto url',
            authURL: authcb
          })
        }
      });
    });
  })

rtr.route('/')
  .post((req, res) => {
    getAuthAccessToken(temp_auth, req.body.code, (auth, cb) => {
      if (cb == 1) {
        listFiles(auth, (subs, cbb) => {
          console.log(subs)
          if (cbb == 1) {
            res.json({
              status: 3, // get file with auth
              files: 'success'
            })
          }
          else {
            console.log('list: keep trying')
            res.json({
              status: 3, // get file with auth
              files: 'problem'
            })
          }
        })
      } else {
        console.log('keep trying')
        res.json({
          status: 3, // get file with auth
          files: 'problem'
        })
      }
    })
  })

module.exports = rtr