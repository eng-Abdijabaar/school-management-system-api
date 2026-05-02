import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id: {
    type: String, 
    required: true
  },
  seq: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

counterSchema.statics.getNextSequence = async function(name) {
  const counter = await this.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return counter.seq;
};

export const Counter = mongoose.model("Counter", counterSchema);