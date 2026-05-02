import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    class_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true,
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    records: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
        },
        status: {
            type: String,
            enum: ["present", "absent", "late"],
            required: true,
        },
    }],
}, { timestamps: true });