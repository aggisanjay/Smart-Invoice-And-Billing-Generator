import express from 'express';
import {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  updateStatus,
  downloadPDF,
  emailInvoice,
} from '../controllers/invoiceController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getInvoices)
  .post(createInvoice);

router.route('/:id')
  .get(getInvoice)
  .put(updateInvoice)
  .delete(deleteInvoice);

router.patch('/:id/status', updateStatus);
router.get('/:id/pdf', downloadPDF);
router.post('/:id/email', emailInvoice);

export default router;
