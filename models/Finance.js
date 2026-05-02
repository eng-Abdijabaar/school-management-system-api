import mongoose from "mongoose";

const financeSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    teacher_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
    },
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
    },
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ["fee", "salary", "expense"],
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    status: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending",
    },
}, { timestamps: true });

const Finance = mongoose.model("Finance", financeSchema);

export default Finance;