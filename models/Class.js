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
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
    }],
    room_number: {
        type: Number,
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const Class = mongoose.model("Class", classSchema);

export default Class;