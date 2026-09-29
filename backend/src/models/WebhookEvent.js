const mongoose = require("mongoose");

const webhookEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      unique: true,
      sparse: true,
    },

    event: {
      type: String,
      required: true,
    },

    reference: {
      type: String,
      index: true,
    },

    processed: {
      type: Boolean,
      default: false,
    },

    payload: {
      type: mongoose.Schema.Types.Mixed,
    },

    processedAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "WebhookEvent",
  webhookEventSchema
);