
import asyncHandler from 'express-async-handler';
import Invoice from '../models/Invoice.js';
import Client from '../models/Client.js';
import generatePDF from '../utils/generatePDF.js';
import sendEmail from '../utils/sendEmail.js';

// @desc   Get all invoices
export const getInvoices = asyncHandler(async (req, res) => {
  const { status, client, search, page = 1, limit = 15 } = req.query;

  const query = { user: req.user._id };
  if (status) query.status = status;
  if (client) query.client = client;
  if (search) query.invoiceNumber = { $regex: search, $options: 'i' };

  const total = await Invoice.countDocuments(query);

  const invoices = await Invoice.find(query)
    .populate('client', 'name email company')
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  res.json({ success: true, total, page: Number(page), invoices });
});

// @desc   Get single invoice
export const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    user: req.user._id,
  })
    .populate('client')
    .populate('user', '-password');

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  res.json({ success: true, invoice });
});

// @desc   Create invoice
export const createInvoice = asyncHandler(async (req, res) => {
  const { client, lines = [], dueDate, notes, terms, currency, discount, discountPct } = req.body;

  const clientDoc = await Client.findOne({
    _id: client,
    user: req.user._id,
  });

  if (!clientDoc) {
    res.status(404);
    throw new Error('Client not found');
  }

  const computedLines = lines.map((l) => {
    const subtotal = l.quantity * l.price;
    const taxAmount = subtotal * (l.taxRate || 0) / 100;
    return { ...l, subtotal, taxAmount, total: subtotal + taxAmount };
  });

  const invoice = await Invoice.create({
    user: req.user._id,
    client,
    dueDate,
    notes,
    terms,
    currency,
    discount: discount || 0,
    discountPct: discountPct || 0,
    lines: computedLines,
  });

  await invoice.populate('client', 'name email company');

  res.status(201).json({ success: true, invoice });
});

// @desc   Update invoice
export const updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  if (invoice.status === 'paid') {
    res.status(400);
    throw new Error('Cannot edit a paid invoice');
  }

  const { lines = invoice.lines, ...rest } = req.body;

  const computedLines = lines.map((l) => {
    const subtotal = l.quantity * l.price;
    const taxAmount = subtotal * (l.taxRate || 0) / 100;
    return { ...l, subtotal, taxAmount, total: subtotal + taxAmount };
  });

  Object.assign(invoice, rest, { lines: computedLines });

  await invoice.save();
  await invoice.populate('client', 'name email company');

  res.json({ success: true, invoice });
});

// @desc   Delete invoice
export const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  res.json({ success: true, message: 'Invoice deleted' });
});

// @desc   Update invoice status
export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const invoice = await Invoice.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  const prevStatus = invoice.status;
  invoice.status = status;

  if (status === 'paid') {
    invoice.amountPaid = invoice.total;
    invoice.balanceDue = 0;
    invoice.paidAt = new Date();
  } else {
    if (prevStatus === 'paid') {
      invoice.amountPaid = 0;
      invoice.paidAt = null;
    }

    invoice.balanceDue = Math.max(
      0,
      invoice.total - (invoice.amountPaid || 0)
    );
  }

  await invoice.save();
  await invoice.populate('client', 'name email company');

  res.json({ success: true, invoice });
});

// @desc   Download invoice PDF
export const downloadPDF = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    user: req.user._id,
  })
    .populate('client')
    .populate('user', '-password');

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${invoice.invoiceNumber}.pdf"`
  );

  const doc = generatePDF(invoice);
  doc.pipe(res);
  doc.end();
});

// @desc   Email invoice
export const emailInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    user: req.user._id,
  })
    .populate('client')
    .populate('user', '-password');

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  await sendEmail({
    to: invoice.client.email,
    subject: `Invoice ${invoice.invoiceNumber} from ${
      invoice.user.businessName || invoice.user.name
    }`,
    html: `
      <h2>Invoice ${invoice.invoiceNumber}</h2>
      <p>Dear ${invoice.client.name},</p>
      <p>Amount Due: ${invoice.currency} ${invoice.balanceDue.toFixed(2)}</p>
      <p>Due Date: ${new Date(invoice.dueDate).toDateString()}</p>
    `,
  });

  invoice.emailedAt = new Date();
  if (invoice.status === 'draft') invoice.status = 'sent';

  await invoice.save();

  res.json({
    success: true,
    message: `Invoice emailed to ${invoice.client.email}`,
  });
});
