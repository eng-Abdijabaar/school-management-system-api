import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { generateId } from "../utils/generateId.js";
import crypto from "crypto";


const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    teacherId: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: Number,
        required: true,
        unique: true,
    },
    profile_img: {
        type: String,
        // required: true,
    },
    documents: {
        type: [String],
       // required: true,
    },
    salary: {
        type: Number,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },              
    password: {
        type: String,
        required: true,
    },
    resetPasswordToken: String,
    resetPasswordTokenExpire: Date,
}, { timestamps: true });

teacherSchema.pre('validate', async function () {
  try {
    if (!this.teacherId) {
      this.teacherId = await generateId({
        type: "teacherId",
        prefix: "TCH"
      });
    }
  } catch (error) {
    throw new Error("Error generating teacher ID: " + error.message);
  }
});

// hash the password before saving the teacher
teacherSchema.pre("save", async function () {
    if (!this.isModified("password")) return ;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// method to compare the password
teacherSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};


// Generate a Password Reset Token
teacherSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.resetPasswordTokenExpire = Date.now() + 10 * 60 * 1000;
    return resetToken;
};


const Teacher = mongoose.model("Teacher", teacherSchema);

export default Teacher;