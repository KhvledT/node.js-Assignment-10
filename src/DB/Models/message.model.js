import mongoose from "mongoose";

const messsageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: function () {
      return !this.attachments || this.attachments.length === 0;
    },
  },
  attachments: [
    {
      type: String,
      required: function () {
        return !this.content;
      }
    },
  ],
});

const MessageModel = mongoose.model("Message", messsageSchema);
export default MessageModel;