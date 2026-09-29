const express = require("express");

const protect = require("../middleware/authMiddleware.js");
const validate = require("../middleware/validateMiddleware.js");

const {
  sendMessage,
  getProjectMessages,
  markProjectMessagesRead,
  getUnreadCount,
} = require("../controllers/messageController.js");

const {
  sendMessageSchema,
} = require("../validators/messageValidator.js");

const router = express.Router();

router.post(
  "/projects/:projectId/messages",
  protect,
  validate(sendMessageSchema),
  sendMessage
);

router.get(
  "/projects/:projectId/messages",
  protect,
  getProjectMessages
);

router.patch(
  "/projects/:projectId/messages/read",
  protect,
  markProjectMessagesRead
);

router.get(
  "/messages/unread-count",
  protect,
  getUnreadCount
);

module.exports = router;
