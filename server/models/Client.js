import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, lowercase: true },
    phone:   { type: String, default: '' },
    company: { type: String, default: '' },
    address: { type: String, default: '' },
    city:    { type: String, default: '' },
    state:   { type: String, default: '' },
    zip:     { type: String, default: '' },
    country: { type: String, default: '' },
    notes:   { type: String, default: '' },
  },
  { timestamps: true }
);

const Client = mongoose.model('Client', clientSchema);

export default Client;
