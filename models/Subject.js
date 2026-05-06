import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
    },

    description: {
        type: String,
        default: "",
    },

    section: {
        type: String,
        required: true,
    },

    weeklySessions: {
        type: Number,
        default: 0,
    },

    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });


subjectSchema.pre('validate', async function () {
  try {
    if (!this.code) {
      this.code = await generateId({
        type: "subjectId",
        prefix: "SUB"
      });
    }
  } catch (error) {
    throw new Error("Error generating subject code: " + error.message);
  }
});

const Subject = mongoose.model("Subject", subjectSchema);
export default Subject;