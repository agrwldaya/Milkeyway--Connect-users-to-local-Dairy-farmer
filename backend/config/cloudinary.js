import { v2 as cloudinary } from 'cloudinary'

export const cloudinaryconnect = () => {
    try {
        cloudinary.config(process.env.CLOUDINARY_URL);
        console.log("Cloudinary connected")
        return cloudinary;
    } catch (error) {
        console.log("Cloudinary error", error)
        throw error;
    }    
};   