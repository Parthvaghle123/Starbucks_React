const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  items: [
    {
      productId: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
        trim: true,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

// Prevent duplicate product entries per user at the DB level
wishlistSchema.index({ userId: 1, "items.productId": 1 });

module.exports = mongoose.model("Wishlist", wishlistSchema);

