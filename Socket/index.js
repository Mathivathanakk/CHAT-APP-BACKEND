import express from "express";
import { Server } from "socket.io";
import http from "http";
import { verifyToken } from "../Middlewares/verifyToken.js";
import Conversation from "../Models/conversationModel.js";
import Message from "../Models/MessageModel.js";
import User from "../Models/userModel.js";
import { getConversation } from "../Middlewares/getConversation.js";

const app = express();

// socket connection

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

// socket running at http://localhost:5000

//online user

const onlineUser = new Set();

io.on("connection", async (socket) => {
  console.log("Connect User", socket.id);

  const token = socket.handshake.auth.token;

  const user = await verifyToken(token);

  //create the room

  socket.join(user?._id?.toString());
  onlineUser.add(user?._id?.toString());

  io.emit("onlineUser", Array.from(onlineUser));

  socket.on("message-page", async (userId) => {
    console.log("userId", userId);
    const userDetails = await User.findById(userId).select("-password");
    const payload = {
      _id: userDetails._id,
      name: userDetails.name,
      email: userDetails.email,
      profile_pic: userDetails.profile_pic,
      online: onlineUser.has(userId),
    };

    socket.emit("message-user", payload);

    //get previous message

    const getConversationMessage = await Conversation.findOne({
      $or: [
        { sender: user?._id, receiver: userId },
        { sender: userId, receiver: user?._id },
      ],
    })
      .populate("messages")
      .sort({ updatedAt: -1 });

    socket.emit("message", getConversationMessage?.messages || []);
  });

  //new message

  socket.on("new message", async (data) => {
    //check conversation is available both user
    let conversation = await Conversation.findOne({
      $or: [
        {
          sender: data?.sender,
          receiver: data?.receiver,
        },
        {
          sender: data?.receiver,
          receiver: data?.sender,
        },
      ],
    });

    //if conversation is not available

    if (!conversation) {
      const createConversation = await Conversation({
        sender: data?.sender,
        receiver: data?.receiver,
      });
      conversation = await createConversation.save();
    }

    // console.log("conversation", conversation);

    const message = new Message({
      text: data.text,
      imageUrl: data.imageUrl,
      videoUrl: data.videoUrl,
      msgByUserId: data.msgByUserId,
    });

    const saveMessage = await message.save();

    //console.log("saveMessage", saveMessage);

    const updateConversation = await Conversation.updateOne(
      { _id: conversation?._id },
      {
        $push: {
          messages: saveMessage?._id,
        },
      }
    );

    const getConversationMessage = await Conversation.findOne({
      $or: [
        {
          sender: data?.sender,
          receiver: data?.receiver,
        },
        {
          sender: data?.receiver,
          receiver: data?.sender,
        },
      ],
    })
      .populate("messages")
      .sort({ updatedAt: -1 });

    io.to(data?.sender).emit("message", getConversationMessage?.messages || []);
    io.to(data?.receiver).emit(
      "message",
      getConversationMessage?.messages || []
    );

    //send Conversation

    const conversationSender = await getConversation(data?.sender);
    const conversationReceiver = await getConversation(data?.receiver);

    io.to(data?.sender).emit("conversation", conversationSender);
    io.to(data?.receiver).emit("conversation", conversationReceiver);
  });

  //sidebar

  socket.on("sidebar", async (currentUserId) => {
    console.log("current user", currentUserId);
    const conversation = await getConversation(currentUserId);
    socket.emit("conversation", conversation);
  });

  socket.on("seen", async (msgByUserId) => {
    let conversation = await Conversation.findOne({
      $or: [
        { sender: user?._id, receiver: msgByUserId },
        { sender: msgByUserId, receiver: user?._id },
      ],
    });

    const conversationMessageId = conversation?.messages || [];
    const updateMessage = await Message.updateMany(
      { _id: { "$in": conversationMessageId }, msgByUserId: msgByUserId },
      { $set: { seen: true } }
    );

    //send Conversation

    const conversationSender = await getConversation(user?._id?.toString());
    const conversationReceiver = await getConversation(msgByUserId);

    io.to(user?._id?.toString()).emit("conversation", conversationSender);
    io.to(msgByUserId).emit("conversation", conversationReceiver);
  });

  //disconnect
  socket.on("disconnect", () => {
    console.log("disconnect", () => {
      console.log("disconnect user", socket.id);
    });
  });


});

export { app, server };
