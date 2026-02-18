
import asyncHandler from 'express-async-handler';
import Invoice from '../models/Invoice.js';
import Client from '../models/Client.js';

// @desc   Get dashboard analytics
// @route  GET /api/dashboard
// @access Private
export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Parallel queries for speed
  const [
    allInvoices,
    totalClients,
    recentInvoices,
    overdueInvoices,
  ] = await Promise.all([
    Invoice.find({ user: userId }),
    Client.countDocuments({ user: userId }),
    Invoice.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('client', 'name company'),
    Invoice.find({
      user: userId,
      dueDate: { $lt: now },
      status: { $in: ['sent', 'draft'] },
    }),
  ]);

  // ─── Status summary counts ─────────────────────────────
  const summary = {
    totalRevenue: 0,
    paid: 0,
    sent: 0,
    draft: 0,
    overdue: 0,
    cancelled: 0,
  };

  allInvoices.forEach((inv) => {
    if (summary[inv.status] !== undefined) {
      summary[inv.status] += 1;
    } else {
      summary[inv.status] = 1;
    }

    if (inv.status === 'paid') {
      summary.totalRevenue += inv.total;
    }
  });

  summary.totalInvoices = allInvoices.length;

  // ─── Monthly revenue ───────────────────────────────────
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(0, i).toLocaleString('default', { month: 'short' }),
    revenue: 0,
    invoices: 0,
  }));

  allInvoices.forEach((inv) => {
    if (inv.status === 'paid' && inv.paidAt && inv.paidAt >= startOfYear) {
      const m = new Date(inv.paidAt).getMonth();
      monthlyData[m].revenue += inv.total;
      monthlyData[m].invoices += 1;
    }
  });

  // ─── Overdue logic ─────────────────────────────────────
  const overdueMap = new Map();

  allInvoices
    .filter((i) => i.status === 'overdue')
    .forEach((i) => overdueMap.set(String(i._id), i));

  overdueInvoices.forEach((i) =>
    overdueMap.set(String(i._id), i)
  );

  const overdueAll = Array.from(overdueMap.values());
  const overdueCount = overdueAll.length;

  const overdueAmount = overdueAll.reduce(
    (s, i) => s + (i.balanceDue || i.total || 0),
    0
  );

  // ─── Outstanding ───────────────────────────────────────
  const outstanding = allInvoices
    .filter((i) => i.status === 'sent' || i.status === 'draft')
    .reduce((s, i) => s + (i.balanceDue || i.total || 0), 0);

  res.json({
    success: true,
    summary: {
      ...summary,
      outstanding,
      overdueCount,
      overdueAmount,
      totalClients,
    },
    monthlyData,
    recentInvoices,
  });
});
