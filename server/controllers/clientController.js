import asyncHandler from 'express-async-handler';
import Client from '../models/Client.js';
import Invoice from '../models/Invoice.js';

// @desc   Get all clients
// @route  GET /api/clients
// @access Private
export const getClients = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;

  const query = { user: req.user._id };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
  }

  const total = await Client.countDocuments(query);

  const clients = await Client.find(query)
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  res.json({
    success: true,
    total,
    page: Number(page),
    clients,
  });
});

// @desc   Get single client
// @route  GET /api/clients/:id
// @access Private
export const getClient = asyncHandler(async (req, res) => {
  const client = await Client.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!client) {
    res.status(404);
    throw new Error('Client not found');
  }

  const invoices = await Invoice.find({
    client: client._id,
    user: req.user._id,
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('invoiceNumber total status invoiceDate');

  res.json({
    success: true,
    client,
    recentInvoices: invoices,
  });
});

// @desc   Create client
// @route  POST /api/clients
// @access Private
export const createClient = asyncHandler(async (req, res) => {
  const client = await Client.create({
    ...req.body,
    user: req.user._id,
  });

  res.status(201).json({ success: true, client });
});

// @desc   Update client
// @route  PUT /api/clients/:id
// @access Private
export const updateClient = asyncHandler(async (req, res) => {
  const client = await Client.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );

  if (!client) {
    res.status(404);
    throw new Error('Client not found');
  }

  res.json({ success: true, client });
});

// @desc   Delete client
// @route  DELETE /api/clients/:id
// @access Private
export const deleteClient = asyncHandler(async (req, res) => {
  const client = await Client.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!client) {
    res.status(404);
    throw new Error('Client not found');
  }

  res.json({ success: true, message: 'Client deleted' });
});
