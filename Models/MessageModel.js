import mongoose from "mongoose";

const MessageModel = new mongoose.Schema(
  {
    text: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    videoUrl: {
      type: String,
      default: "",
    },
    seen: {
      type: Boolean,
      default: false,
    },
    msgByUserId: {
      type: mongoose.Schema.ObjectId,
      require: true,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", MessageModel);
export default Message;
