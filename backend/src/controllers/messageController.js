const asyncHandler = require("../utils/asyncHandler");
const messageService = require("../services/message.js");

const sendMessage = asyncHandler(async (req, res) => {
  const message = await messageService.sendMessage(
    req.params.projectId,
    req.user._id,
    req.body
  );

  res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: { message },
  });
});

const getProjectMessages = asyncHandler(
  async (req, res) => {
    const messages =
      await messageService.getProjectMessages(
        req.params.projectId,
        req.user._id
      );

    res.status(200).json({
      success: true,
      data: { messages },
    });
  }
);

const markProjectMessagesRead = asyncHandler(async (req, res) => {
  await messageService.markProjectMessagesRead(
    req.params.projectId,
    req.user._id
  );

  res.status(200).json({
    success: true,
    message: "Messages marked as read",
  });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await messageService.countUnreadMessages(
    req.user._id
  );

  res.status(200).json({
    success: true,
    data: { count },
  });
});

module.exports = {
  sendMessage,
  getProjectMessages,
  markProjectMessagesRead,
  getUnreadCount,
};
