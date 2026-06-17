import mongoose from 'mongoose';

const contentSectionSchema = new mongoose.Schema({
  key: {
    type: String,
    required: [true, 'Section key is required'],
    unique: true,
    trim: true,
  },
  label: {
    type: String,
    default: '',
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

contentSectionSchema.index({ key: 1 });

export default mongoose.model('ContentSection', contentSectionSchema);
