import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true },
    password:     { type: String, required: true, minlength: 6 },
    businessName: { type: String, default: '' },
    businessLogo: { type: String, default: '' },
    address:      { type: String, default: '' },
    phone:        { type: String, default: '' },
    taxId:        { type: String, default: '' },
    currency:     { type: String, default: 'USD' },
    theme:        { type: String, enum: ['light', 'dark'], default: 'light' },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
