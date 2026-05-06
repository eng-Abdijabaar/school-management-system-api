import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
    },
    section: {
        type: String,
        required: true,
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true,
    },
    teacher: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    total_marks: {
        type: Number,
        required: true,
    },
    results: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
        },
        marks_obtained: {
            type: Number,
        },
    }],
}, { timestamps: true });

const Exam = mongoose.model("Exam", examSchema);

export default Exam;