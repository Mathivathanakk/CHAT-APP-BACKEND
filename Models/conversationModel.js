import mongoose from "mongoose";

const conversationModel = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.ObjectId,
      require: true,
      ref: "User",
    },
    receiver: {
      type: mongoose.Schema.ObjectId,
      require: true,
      ref: "User",
    },
    messages: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Message",
      },
    ],
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationModel);

export default Conversation;
