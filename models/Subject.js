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

    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher", 
    },

    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
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

const Subject = mongoose.model("Subject", subjectSchema);
export default Subject;