const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SheetsData = new Schema({
  subscriptionId: {
    type: String,
    required: true
  },
  sheets: {      // Sheet's id and Name
    type: Array,
    default: []
  }, 
  totalTabs: {
    type: Number,
    default: 0
  },
  TabsAdded: {
    type: Number,
    default: 0
  },
  tabs: Array,   // Name, column count, row count
})

module.exports = SheetData = mongoose.model('sheets', SheetsData)