import express from 'express';
import asyncHandler from 'express-async-handler';
import Item from '../models/Item.js';
import { protect } from '../middleware/authMiddleware.js';

// ─── Controller ─────────────────────────────────────────────

const getItems = asyncHandler(async (req, res) => {
  const items = await Item.find({ user: req.user._id }).sort({ name: 1 });
  res.json({ success: true, items });
});

const createItem = asyncHandler(async (req, res) => {
  const item = await Item.create({
    ...req.body,
    user: req.user._id,
  });

  res.status(201).json({ success: true, item });
});

const updateItem = asyncHandler(async (req, res) => {
  const item = await Item.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true }
  );

  if (!item) {
    res.status(404);
    throw new Error('Item not found');
  }

  res.json({ success: true, item });
});

const deleteItem = asyncHandler(async (req, res) => {
  await Item.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  res.json({ success: true, message: 'Item deleted' });
});

// ─── Router ─────────────────────────────────────────────────

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getItems)
  .post(createItem);

router.route('/:id')
  .put(updateItem)
  .delete(deleteItem);

export default router;
