const rtr = require('express').Router()
const fs = require('fs');
const { google } = require('googleapis');

const Subscriptions = require('../model/subs')
const SheetData = require('../model/sheets')
const StoredSheet = require('../model/sheetsStored')

// If modifying these scopes, delete token.json.
const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/spreadsheets'
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

async function listFiles(auth, username, token, callback) {
  try {
    let subscriptions = []
    const drive = google.drive({ version: 'v3', auth });
    const userdetail = await drive.about.get({ "fields": "user" })
    const newuser = userdetail.data.user
    const query = Subscriptions.find({ subscriptionId: newuser.emailAddress, authUser: username })
    const sub = await query.exec()
    console.log(sub)
    console.log(sub.length)
    if (sub.length == 0) {
      console.log('creating new subscription')
      subscriptions.push(newuser)
      const flist = await drive.files.list({
        q: "mimeType='application/vnd.google-apps.spreadsheet'", // xlsx files only
        fields: 'nextPageToken, files(id, name)', // name and id of spreadsheets
      })
      const filesList = flist.data.files
      subscriptions.push(filesList)
      // Save credentials, token, and sheets in to Table (subscriptions)
      const newSub = new Subscriptions({
        authUser: username,
        subscriptionId: newuser.emailAddress,
        userDetails: newuser,
        oAuth: token,
        sheetCount: filesList.length
      })
      newSub.save()
      // save sheets data into new Table (sheets)
      const newSheet = new SheetData({
        username: username,
        subscriptionId: newuser.emailAddress,
        sheets: filesList
      })
      newSheet.save()
      console.log('saved')
      callback(subscriptions)
    } else {
      console.log('subscription already exists')
      callback(null)
    }
  } catch (error) {
    if (error) console.log('The API returned an error: ' + error);
    callback(null)
  }
}

async function getTabsList(auth, sheetId, callback) {
  try {
    let tabs = []
    const sheets = google.sheets({ version: 'v4', auth });
    const sheet_res = await sheets.spreadsheets.get({
      spreadsheetId: sheetId  //sheet.id
    })
    for (let i = 0; i < sheet_res.data.sheets.length; i++) {
      tabs.push(sheet_res.data.sheets[i].properties.title)
    }
    callback(tabs)
  } catch (error) {
    if (error) console.log('The API returned an error: ' + error);
    callback(null)
  }
}

async function getSheetData(auth, sheetId, tabId, callback) {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetRes = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: tabId,
      majorDimension: 'COLUMNS'
    })
    callback(sheetRes.data.values.length)
  } catch (error) {
    if (error) console.log('The API returned an error: ' + error);
    callback(null)
  }
}

// create new subscription
rtr.route('/add-sub')
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
  // Get list of all subscription of a user (/subscription)
  .get((req, res) => {
    if (req.session.userdata) {
      if (req.query.code) {
        if (temp_auth) {
          getAuthAccessToken(temp_auth, req.query.code, (auth, token) => {
            if (auth && token) {
              listFiles(auth, req.session.userdata.username, token, subs => {
                if (subs) {
                  req.session.userdata = {
                    username: req.session.userdata.username,
                    name: req.session.userdata.name,
                    redir: '/subscriptions'
                  }
                  res.redirect('/')
                }
                else {
                  res.json({
                    status: 3, // subscription exists
                    msg: 'Subscription already exists'
                  })
                }
              })
            } else {
              res.json({
                status: 1, // get file with auth
                msg: 'Something Went Wrong'
              })
            }
          })
        } else {
          res.json({
            status: 0,
            msg: 'Something went wrong'
          })
        }
      } else {
        if (req.session.userdata.redir) {
          req.session.userdata = {
            username: req.session.userdata.username,
            name: req.session.userdata.name,
            redir: null
          }
        }
        Subscriptions.find({ authUser: req.session.userdata.username }, (err, subsList) => {
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
      }
    } else {
      res.json({
        status: 0, // change to 401
        msg: 'Login First',
        subfiles: []
      })
    }
  })
// // get oAuth -> Acces -> then save details (user, oAuth2Client, subscription)
// .post((req, res) => {
// })

// open add sheet form
rtr.route('/sheetform/:subsid')
  .get((req, res) => {
    const subsId = req.params.subsid.toString()
    SheetData.find({ subscriptionId: subsId, username: req.session.userdata.username }, (err, subsList) => {
      if (subsList) {
        res.json({
          status: 200,
          subfiles: subsList,
          subsId: subsId
        })
      } else {
        res.json({
          status: 200,
          subfiles: [],
          subsId: subsId
        })
      }
    })
  })

// get tab list of sheet with id = sheetId
rtr.route('/add-sheet/:subsId/:sheetId')
  .get((req, res) => {
    if (temp_auth) {
      getTabsList(temp_auth, req.params.sheetId, tabslist => {
        if (tabslist.length) {
          res.json({
            status: 2,
            tablist: tabslist
          })
        } else {
          res.json({
            status: 0,
            tablist: []
          })
        }
      })
    } else {
      fs.readFile(__dirname + '/credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);

        const { client_secret, client_id, redirect_uris } = JSON.parse(content).web; // get credentials
        const oAuth2Client = new google.auth.OAuth2( // create and assign google oAuth2.0
          client_id, client_secret, redirect_uris[0]);

        Subscriptions.find({ subscriptionId: req.params.subsId }, (err, sub) => {
          oAuth2Client.setCredentials(sub[0].oAuth)

          getTabsList(oAuth2Client, req.params.sheetId, tabslist => {
            if (tabslist.length) {
              res.json({
                status: 2,
                tablist: tabslist
              })
            } else {
              res.json({
                status: 0,
                tablist: []
              })
            }
          })
        })
      })
    }
  })

rtr.route('/add-sheet')
  .post((req, res) => {
    if (req.session.userdata) {
      SheetData.find({ sheetId: req.body.sheetId, tabName: req.body.tabId }, (err, sheet) => {
        if (sheet.length != 0) {
          res.json({
            status: 0,
            msg: 'Sheet Already Exists'
          })
        }
        else {
          if (temp_auth) {
            getSheetData(temp_auth, req.body.sheetId, req.body.tabId, sheetData => {
              // Save SpreadSheet Data
              const newSheetData = new StoredSheet({
                username: req.session.userdata.username,
                subscriptionId: req.body.subsId,
                sheetId: req.body.sheetId,
                tabName: req.body.tabId,
                columnCount: sheetData
              })
              console.log(newSheetData)
              newSheetData.save()
                .then(res => console.log(res))
              res.json({
                status: 1,
                msg: 'Sheet saved successfully!'
              })
            })
          } else {
            fs.readFile(__dirname + '/credentials.json', (err, content) => {
              if (err) return console.log('Error loading client secret file:', err);

              const { client_secret, client_id, redirect_uris } = JSON.parse(content).web; // get credentials
              const oAuth2Client = new google.auth.OAuth2( // create and assign google oAuth2.0
                client_id, client_secret, redirect_uris[0]);
              Subscriptions.find({ subscriptionId: req.body.subsId }, (err, sub) => {
                oAuth2Client.setCredentials(sub[0].oAuth)
                getSheetData(oAuth2Client, req.body.sheetId, req.body.tabId, sheetData => {
                  // Save SpreadSheet Data
                  const newSheetData = new StoredSheet({
                    username: req.session.userdata.username,
                    subscriptionId: req.body.subsId,
                    sheetId: req.body.sheetId,
                    tabName: req.body.tabId,
                    columnCount: sheetData
                  })
                  newSheetData.save()
                  res.json({
                    status: 1,
                    msg: 'Sheet saved successfully.'
                  })
                })
              })
            })
          }
        }
      })
    } else {
      res.json({
        status: 0, // change to 401
        msg: 'Login First',
        subfiles: []
      })
    }
  })

module.exports = rtr