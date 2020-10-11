const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SubscriptionData = new Schema({
  authUser: {
    type: String,
    required: true
  },
  subscriptionId: {
    type: String,
    required: true
  },
  userDetails: {
    type: Object,
    required: true
  },
  token: Object,
  sheetCount: Number
})

module.exports = Subscriptions = mongoose.model('subscriptions', SubscriptionData)