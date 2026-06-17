import mongoose from 'mongoose';

const catalogServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['haircut', 'beard', 'color', 'facial', 'massage', 'other'],
    default: 'other'
  },
  imageUrl: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

catalogServiceSchema.index({ isActive: 1, displayOrder: 1 });

export default mongoose.model('CatalogService', catalogServiceSchema);
