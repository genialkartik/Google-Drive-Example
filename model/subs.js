const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SubscriptionData = new Schema({
  account_holder: {
    type: String,
    required: true
  },
  subscriptions: [{
    email: String,
    name: String,
    googleId: Number,
    imageUrl: String,
    tokedId: String,
    accessToken: String
  }]
})

module.exports = Subscriptions = mongoose.model('subscriptions', SubscriptionData)