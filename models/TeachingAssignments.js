import mongoose from "mongoose";

const teachingAssignmentSchema = new mongoose.Schema({
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true,
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher",
        required: true,
    },
}, { timestamps: true });

const TeachingAssignment = mongoose.model("TeachingAssignment", teachingAssignmentSchema);  
export default TeachingAssignment;