import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: { type: String, select: false },
  userType: { type: String, enum: ['customer', 'salon', 'admin'], default: 'customer' },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  phone: { type: String, default: '' },
  dateOfBirth: { type: String, default: '' },
  gender: { type: String, default: 'male' },
  profilePicture: { type: String, default: '' },
  address: {
    street: { type: String, default: '' },
    area: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    country: { type: String, default: 'India' },
  },
  lastLogin: Date,
}, { timestamps: true });

export default mongoose.model('User', userSchema);
