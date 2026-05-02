import mongoose from "mongoose";
import { generateId } from "../utils/generateId.js";


const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
    },
    studentId: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: Number,
        required: true,
        unique: true,
    },
    parent_number: {
        type: Number,
        required: true,
        unique: true,
    },
    profile_img: {
        type: String,
    },
    documents: {
        type: [String],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    password: {
        type: String,
        required: true,
    },
}, { timestamps: true });

studentSchema.pre('save', async function (next) {
  try {
    if (!this.studentId) {
      this.studentId = await generateId({
        type: "studentId",
        prefix: "STU"
      });
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Student = mongoose.model("Student", studentSchema);
export default Student;