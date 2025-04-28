const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  small: { type: Number },
  medium: { type: Number },
  large: { type: Number }
});

const menuItemSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, required: true },
  restaurantName: { type: String, required: true },
  foodName: { type: String, required: true },
  category: { type: String, required: true }, // Chicken, Cheese, Veg, etc.
  imageUrl: { type: String },
  prices: priceSchema,
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
