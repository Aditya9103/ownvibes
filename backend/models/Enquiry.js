import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema({
    studentName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    city: { type: String, required: true },
    course: { type: [String], required: true },
    visitorName: { type: String },
    mobileNumber: { type: String },
    address: { type: String },
    referenceName: { type: String },
    score: { type: String },
    statePreference: { type: [String] },
    status: { type: String, enum: ['interested', 'not_interested'], default: 'interested' },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Enquiry', enquirySchema);
