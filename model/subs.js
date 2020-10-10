const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SubscriptionData = new Schema({
  account_holder: {
    type: String,
    required: true
  },
  subscriptions: [{
    subscriptionId: Number, // googleId
    email: String,
    name: String,
    imageUrl: String, // Avatar
    sheetsCount: Number,
    tokedId: String,
    accessToken: String
  }]
})

module.exports = Subscriptions = mongoose.model('subscriptions', SubscriptionData)