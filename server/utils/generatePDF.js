import PDFDocument from 'pdfkit';

const formatCurrency = (amount = 0, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);

const generatePDF = (invoice) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const { user, client } = invoice;

  const PAGE_WIDTH = doc.page.width - 100;

  // ─── HEADER ───────────────────────────────────────────────
  doc.rect(0, 0, doc.page.width, 160).fill('#1a1a2e');

  doc.fillColor('#ffffff').fontSize(28).font('Helvetica-Bold')
    .text(user.businessName || user.name, 50, 40);

  doc.fillColor('#a0a0c0').fontSize(10).font('Helvetica')
    .text(user.address || '', 50, 80)
    .text(user.phone || '', 50, 95)
    .text(user.email || '', 50, 110);

  doc.fillColor('#e8e8ff').fontSize(32).font('Helvetica-Bold')
    .text('INVOICE', 350, 45, { align: 'right', width: 200 });

  doc.fillColor('#a0a0c0').fontSize(10).font('Helvetica')
    .text(`# ${invoice.invoiceNumber}`, 350, 90, { align: 'right', width: 200 })
    .text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, 350, 105, { align: 'right', width: 200 })
    .text(`Due: ${new Date(invoice.dueDate).toLocaleDateString()}`, 350, 120, { align: 'right', width: 200 });

  const statusColors = {
    paid: '#10b981',
    sent: '#3b82f6',
    draft: '#6b7280',
    overdue: '#ef4444',
    cancelled: '#9ca3af',
  };

  const statusColor = statusColors[invoice.status] || '#6b7280';

  doc.roundedRect(400, 135, 100, 20, 4).fill(statusColor);
  doc.fillColor('#fff').fontSize(9).font('Helvetica-Bold')
    .text(invoice.status.toUpperCase(), 400, 140, { align: 'center', width: 100 });

  // ─── BILL TO ──────────────────────────────────────────────
  doc.fillColor('#1a1a2e').fontSize(10).font('Helvetica-Bold')
    .text('BILL TO', 50, 185);

  doc.moveTo(50, 198).lineTo(200, 198).strokeColor('#e2e8f0').lineWidth(1).stroke();

  doc.fillColor('#374151').fontSize(11).font('Helvetica-Bold')
    .text(client.name, 50, 205);

  doc.fillColor('#6b7280').fontSize(10).font('Helvetica')
    .text(client.company || '', 50, 220)
    .text(client.email || '', 50, 234)
    .text(client.address || '', 50, 248);

  // ─── TABLE HEADER ─────────────────────────────────────────
  const tableTop = 300;

  doc.rect(50, tableTop, PAGE_WIDTH, 30).fill('#1a1a2e');

  doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold');

  const cols = [50, 250, 320, 380, 450];

  ['DESCRIPTION', 'QTY', 'UNIT PRICE', 'TAX', 'AMOUNT'].forEach((h, i) => {
    doc.text(h, cols[i], tableTop + 10, {
      width: 90,
      align: i === 0 ? 'left' : 'right',
    });
  });

  // ─── TABLE ROWS ───────────────────────────────────────────
  let y = tableTop + 40;

  invoice.lines.forEach((line, idx) => {
    if (y > 700) {
      doc.addPage();
      y = 50;
    }

    if (idx % 2 === 0) {
      doc.rect(50, y - 5, PAGE_WIDTH, 28).fill('#f8fafc');
    }

    doc.fillColor('#374151').fontSize(10).font('Helvetica-Bold')
      .text(line.name, 50, y, { width: 190 });

    if (line.description) {
      doc.fillColor('#9ca3af').fontSize(8).font('Helvetica')
        .text(line.description, 50, y + 13, { width: 190 });
    }

    doc.fillColor('#374151').fontSize(10).font('Helvetica')
      .text((line.quantity ?? 0).toString(), cols[1], y, { width: 60, align: 'right' })
      .text(formatCurrency(line.price, invoice.currency), cols[2], y, { width: 55, align: 'right' })
      .text(`${line.taxRate || 0}%`, cols[3], y, { width: 60, align: 'right' })
      .text(formatCurrency(line.total, invoice.currency), cols[4], y, { width: 60, align: 'right' });

    y += 32;
  });

  // ─── TOTALS ───────────────────────────────────────────────
  const totY = y + 20;

  doc.moveTo(350, totY).lineTo(PAGE_WIDTH + 50, totY)
    .strokeColor('#e2e8f0').lineWidth(1).stroke();

  let tY = 0;

  const rows = [
    ['Subtotal', formatCurrency(invoice.subtotal, invoice.currency)],
    ['Tax', formatCurrency(invoice.taxAmount, invoice.currency)],
    ...(invoice.discount > 0
      ? [['Discount', `-${formatCurrency(invoice.discount, invoice.currency)}`]]
      : []),
    ...(invoice.discountPct > 0
      ? [['Discount', `-${invoice.discountPct}%`]]
      : []),
  ];

  rows.forEach(([l, v]) => {
    doc.fillColor('#6b7280').fontSize(10).font('Helvetica')
      .text(l, 350, totY + 10 + tY, { width: 120, align: 'right' })
      .text(v, 480, totY + 10 + tY, { width: 70, align: 'right' });

    tY += 20;
  });

  doc.rect(350, totY + tY + 15, PAGE_WIDTH + 50 - 350, 35).fill('#1a1a2e');

  doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold')
    .text('TOTAL DUE', 355, totY + tY + 22, { width: 120, align: 'right' })
    .text(formatCurrency(invoice.balanceDue, invoice.currency), 480, totY + tY + 22, { width: 70, align: 'right' });

  // ─── NOTES / TERMS ────────────────────────────────────────
  const noteY = totY + tY + 75;

  if (invoice.notes) {
    doc.fillColor('#374151').fontSize(10).font('Helvetica-Bold')
      .text('Notes', 50, noteY);

    doc.fillColor('#6b7280').fontSize(9).font('Helvetica')
      .text(invoice.notes, 50, noteY + 15, { width: 250 });
  }

  if (invoice.terms) {
    doc.fillColor('#374151').fontSize(10).font('Helvetica-Bold')
      .text('Terms & Conditions', 50, noteY + 40);

    doc.fillColor('#6b7280').fontSize(9).font('Helvetica')
      .text(invoice.terms, 50, noteY + 55, { width: 250 });
  }

  // ─── FOOTER ───────────────────────────────────────────────
  doc.rect(0, doc.page.height - 50, doc.page.width, 50).fill('#1a1a2e');

  doc.fillColor('#a0a0c0').fontSize(9).font('Helvetica')
    .text(
      `Thank you for your business! — ${user.businessName || user.name}`,
      0,
      doc.page.height - 30,
      { align: 'center', width: doc.page.width }
    );

  return doc;
};

export default generatePDF;
