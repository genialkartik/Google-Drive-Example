const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SheetsData = new Schema({
  subscriptionId: {
    type: Number,
    required: true
  },
  sheets: [{ // All sheets associated with subscriptionId
    sheetId: Number,
    sheetName: String,
    TotalTabs: Number,
    TabsCount: Number,
    tabs: [{  // All Tabs within a sheets
      TabName: String,
      columnCount: Number,
      rowCount: Number
    }]
  }]
})

module.exports = SheetData = mongoose.model('sheets', SheetsData)