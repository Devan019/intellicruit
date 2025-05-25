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
}, {
    timestamps: true,
})


const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);


export default UserModel;