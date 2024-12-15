// server/models/item.js
const mongoose = require('mongoose');
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  category: { type: String },
  image: { type: String }
});

module.exports = mongoose.model('Item', itemSchema);