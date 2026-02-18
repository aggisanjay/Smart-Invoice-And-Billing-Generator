import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:        { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price:       { type: Number, required: true, min: 0 },
    unit:        { 
      type: String,
      default: 'hrs',
      enum: ['hrs', 'pcs', 'kg', 'lbs', 'days', 'months', 'flat']
    },
    taxRate:     { type: Number, default: 0, min: 0, max: 100 },
    category:    { type: String, default: 'Service' },
  },
  { timestamps: true }
);

const Item = mongoose.model('Item', itemSchema);

export default Item;
