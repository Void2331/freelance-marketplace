const AppError = require("../utils/AppError");
const Project = require("../models/project.js");
const Message = require("../models/message.js");

/*
  Confirms the user is either the client or the
  freelancer on this project, and returns the
  project plus who the "other party" is.
*/
const assertParticipant = async (
  projectId,
  userId
) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const userIdStr = userId.toString();

  const isClient =
    project.client.toString() === userIdStr;

  const isFreelancer =
    project.freelancer.toString() === userIdStr;

  if (!isClient && !isFreelancer) {
    throw new AppError(
      "You are not a participant on this project",
      403
    );
  }

  const otherParty = isClient
    ? project.freelancer
    : project.client;

  return { project, otherParty };
};

/*
====================================================
SEND A MESSAGE
Receiver is inferred automatically as
"the other party" on the project.
====================================================
*/
const sendMessage = async (
  projectId,
  senderId,
  { message, attachments }
) => {
  const { otherParty } = await assertParticipant(
    projectId,
    senderId
  );

  const doc = await Message.create({
    project: projectId,
    sender: senderId,
    receiver: otherParty,
    message,
    attachments: attachments || [],
  });

  return doc;
};

/*
====================================================
GET A PROJECT'S CONVERSATION
Marks any unread messages addressed to the
requester as read.
====================================================
*/
const getProjectMessages = async (
  projectId,
  userId
) => {
  await assertParticipant(projectId, userId);

  const messages = await Message.find({
    project: projectId,
  })
    .populate("sender", "name avatar")
    .populate("receiver", "name avatar")
    .sort({ createdAt: 1 });

  await Message.updateMany(
    {
      project: projectId,
      receiver: userId,
      readAt: null,
    },
    {
      $set: { readAt: new Date() },
    }
  );

  return messages;
};

module.exports = {
  sendMessage,
  getProjectMessages,
};

/*
====================================================
COUNT UNREAD MESSAGES (across every project the user is on)
====================================================
*/
const countUnreadMessages = async (userId) => {
  const count = await Message.countDocuments({
    receiver: userId,
    readAt: null,
  });

  return count;
};

module.exports.countUnreadMessages = countUnreadMessages;

/*
====================================================
MARK ALL MESSAGES IN A PROJECT AS READ (for me)
====================================================
*/
const markProjectMessagesRead = async (projectId, userId) => {
  await assertParticipant(projectId, userId);

  await Message.updateMany(
    {
      project: projectId,
      receiver: userId,
      readAt: null,
    },
    {
      readAt: new Date(),
    }
  );
};

module.exports.markProjectMessagesRead = markProjectMessagesRead;
