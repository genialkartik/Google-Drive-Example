const rtr = require('express').Router()
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const { oAuth } = require('../config/dev');


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.metadata'];
const TOKEN_PATH = 'token.json';

let temp_auth;
let authURL = 0;
let token_found = 0;

function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(__dirname + '/' + TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    console.log('token exists')
    oAuth2Client.setCredentials(JSON.parse(token));
    temp_auth = oAuth2Client;
    token_found = 1;
    callback(oAuth2Client, 0);
  });
}

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  temp_auth = oAuth2Client
  authURL = authUrl
  console.log('Authorize this app by visiting this url:', authUrl);
  callback(authUrl, 1)
}

function getAuthAccessToken(oAuth2Client, code, callback) {
  console.log(code)
  oAuth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err);
    oAuth2Client.setCredentials(token);
    // Store the token to disk for later program executions
    fs.writeFile(__dirname + '/' + TOKEN_PATH, JSON.stringify(token), (err) => {
      if (err) return console.error(err);
      console.log('Token stored to', TOKEN_PATH);
    });
    console.log('4')
    temp_auth = oAuth2Client
    callback(1);
  });
}

function listFiles(auth, callback) {
  const drive = google.drive({ version: 'v3', auth });
  drive.files.list({
    q: "mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'",
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    if (files.length) {
      console.log('Files:');
      files.map((file) => {
        console.log(`${file.name} (${file.id})`);
      });
    } else {
      console.log('No files found.')
    }
  })
  callback(1);
}

rtr.route('/add')
  .get((req, res) => {
    // Load client secrets from a local file.
    fs.readFile(__dirname + '/credentials.json', (err, content) => {
      if (err) return console.log('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Drive API.
      authorize(JSON.parse(content), (authcb, acb) => {
        if (acb == 0) {
          listFiles(authcb, cbb => {
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
    getAuthAccessToken(temp_auth, req.body.code, cb => {
      if (cb == 1) {
        listFiles(temp_auth, cbb => {
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