const mongoose = require("mongoose");
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

  return Message.find({
    project: projectId,
  })
    .populate("sender", "name avatar")
    .populate("receiver", "name avatar")
    .sort({ createdAt: 1 });
};

/*
====================================================
GET MESSAGE CONVERSATIONS
Returns one conversation summary per project the
requesting user participates in. Projects without
messages are omitted because they are not yet
conversations.
====================================================
*/
const getMessageConversations = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(
    userId
  );

  const conversations = await Project.aggregate([
    {
      $match: {
        $or: [
          { client: userObjectId },
          { freelancer: userObjectId },
        ],
      },
    },
    {
      $lookup: {
        from: "messages",
        let: { projectId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$project", "$$projectId"],
              },
            },
          },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
          {
            $project: {
              _id: 0,
              message: 1,
              sender: 1,
              createdAt: 1,
            },
          },
        ],
        as: "lastMessage",
      },
    },
    {
      $match: {
        "lastMessage.0": { $exists: true },
      },
    },
    {
      $lookup: {
        from: "messages",
        let: { projectId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$project", "$$projectId"],
                  },
                  { $eq: ["$receiver", userObjectId] },
                  { $eq: ["$readAt", null] },
                ],
              },
            },
          },
          { $count: "count" },
        ],
        as: "unread",
      },
    },
    {
      $set: {
        lastMessage: {
          $arrayElemAt: ["$lastMessage", 0],
        },
        unreadCount: {
          $ifNull: [
            { $arrayElemAt: ["$unread.count", 0] },
            0,
          ],
        },
        participantId: {
          $cond: [
            { $eq: ["$client", userObjectId] },
            "$freelancer",
            "$client",
          ],
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "participantId",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1,
              avatar: 1,
            },
          },
        ],
        as: "participant",
      },
    },
    {
      $set: {
        participant: {
          $arrayElemAt: ["$participant", 0],
        },
      },
    },
    {
      $project: {
        _id: 0,
        projectId: "$_id",
        projectTitle: "$title",
        participant: 1,
        lastMessage: 1,
        unreadCount: 1,
        updatedAt: "$lastMessage.createdAt",
      },
    },
    { $sort: { "lastMessage.createdAt": -1 } },
  ]);

  return conversations;
};

module.exports = {
  sendMessage,
  getProjectMessages,
  getMessageConversations,
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
