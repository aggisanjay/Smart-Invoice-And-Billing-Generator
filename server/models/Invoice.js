import mongoose from 'mongoose';

const invoiceLineSchema = new mongoose.Schema(
  {
    item:        { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    name:        { type: String, required: true },
    description: { type: String, default: '' },
    quantity:    { type: Number, required: true, min: 0 },
    price:       { type: Number, required: true, min: 0 },
    unit:        { type: String, default: 'hrs' },
    taxRate:     { type: Number, default: 0 },

    // Computed
    subtotal:    { type: Number }, // qty * price
    taxAmount:   { type: Number }, // subtotal * taxRate / 100
    total:       { type: Number }, // subtotal + taxAmount
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },

    invoiceNumber: { type: String },
    invoiceDate:   { type: Date, default: Date.now },
    dueDate:       { type: Date, required: true },

    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      default: 'draft',
    },

    lines: [invoiceLineSchema],

    // Pricing summary
    subtotal:    { type: Number, default: 0 },
    taxAmount:   { type: Number, default: 0 },
    discount:    { type: Number, default: 0 },
    discountPct: { type: Number, default: 0 },
    total:       { type: Number, default: 0 },
    amountPaid:  { type: Number, default: 0 },
    balanceDue:  { type: Number, default: 0 },

    currency:  { type: String, default: 'USD' },
    notes:     { type: String, default: '' },
    terms:     { type: String, default: 'Payment due within 30 days.' },

    emailedAt: { type: Date },
    paidAt:    { type: Date },
  },
  { timestamps: true }
);

// Auto-generate invoice number + compute totals
invoiceSchema.pre('save', async function (next) {
  if (this.isNew && !this.invoiceNumber) {
    const count = await this.constructor.countDocuments({ user: this.user });
    this.invoiceNumber = `INV-${String(count + 1).padStart(5, '0')}`;
  }

  // Recompute totals safely
  this.subtotal  = this.lines.reduce((s, l) => s + (l.subtotal || 0), 0);
  this.taxAmount = this.lines.reduce((s, l) => s + (l.taxAmount || 0), 0);

  const gross = this.subtotal + this.taxAmount;
  const disc  = this.discountPct > 0
    ? (gross * this.discountPct) / 100
    : this.discount;

  this.total      = Math.max(0, gross - disc);
  this.balanceDue = Math.max(0, this.total - this.amountPaid);

  next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

export default Invoice;
