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
        sparse: true,
    },
    studentId: {
        type: String,
        required: true,
        unique: true,
    },
    section: {
        type: String,
        required: true,
    },
    phone: {
        type: Number,
        required: true,
        unique: true,
    },
    parent_number: {
        type: Number,
        required: true,
    },
    grade: {
        type: Number,
        required: true
    },
    profile_img: {
        public_id: String,
        url: String
    },
    documents: [{
        public_id: String,
        url: String
    }],
    isActive: {
        type: Boolean,
        default: true,
    },
    password: {
        type: String,
        required: true,
    },
}, { timestamps: true });

studentSchema.pre('validate', async function (next) {
    try {
        if (!this.studentId) {
            this.studentId = await generateId({
                type: "studentId",
                prefix: "STU"
            });
        }
    } catch (error) {
        throw new Error("Error generating student ID: " + error.message);
    }
});

const Student = mongoose.model("Student", studentSchema);
export default Student;