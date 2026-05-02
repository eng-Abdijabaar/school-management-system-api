import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
    class_name: {
        type: String,
        required: true,
    },
    section: {
        type: String,
        required: true,
    },
    subject: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
    }],
    teacher: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true,
    }],
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
    }],
    room_number: {
        type: Number,
    },
    isActive: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

const Class = mongoose.model("Class", classSchema);

export default Class;