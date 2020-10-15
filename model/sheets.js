const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SheetsData = new Schema({
  username: {
    type: String,
    required: true
  },
  subscriptionId: {
    type: String,
    required: true
  },
  sheets: {      // Sheet's id and Name
    type: Array,
    default: []
  }
})

module.exports = SheetData = mongoose.model('sheets', SheetsData)