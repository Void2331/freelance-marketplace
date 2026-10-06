const express = require("express");

const protect = require("../middleware/authMiddleware.js");
const validate = require("../middleware/validateMiddleware.js");
const objectIdParam = require("../middleware/objectIdParam.js");

const {
  sendMessage,
  getProjectMessages,
  markProjectMessagesRead,
  getUnreadCount,
  getMessageConversations,
} = require("../controllers/messageController.js");

const {
  sendMessageSchema,
} = require("../validators/messageValidator.js");

const router = express.Router();

/*
  Every path param in this router is a Mongo ObjectId.
*/
router.param("projectId", objectIdParam);


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

router.get(
  "/messages/conversations",
  protect,
  getMessageConversations
);

module.exports = router;
