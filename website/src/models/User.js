import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    clerk_id: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    resume_url: {
        type: String,
    }
},{
    timestamps: true,
})


export default mongoose.models.User || mongoose.model("User", UserSchema);



