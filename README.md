<div align="center">

# 🧾 Smart Invoice & Billing Generator

### A full-stack MERN application for professional invoice management

[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)](https://jwt.io/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=flat-square)](https://github.com/yourusername/invoice-app)

</div>

---

## 📌 Overview

**Smart Invoice & Billing Generator** is a production-ready web application that lets freelancers and businesses create, manage, and send professional invoices in seconds. Built on the MERN stack with JWT authentication, PDF generation, email delivery, an analytics dashboard, and full dark/light mode support.

> ✅ No more spreadsheets. ✅ No more chasing payments manually. ✅ Real-time financial visibility.

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🔐 **Authentication** | Secure JWT-based register & login with bcrypt password hashing |
| 📄 **Invoice CRUD** | Create, read, update, delete invoices with auto-numbered IDs |
| 👥 **Client Management** | Full client directory with search, notes, and invoice history |
| 📦 **Item Catalog** | Reusable product/service catalog for quick invoice line items |
| 🧮 **Smart Totals** | Per-line tax rates, percentage/flat discounts, auto-calculated totals |
| 🖨️ **PDF Generation** | Download professionally styled PDF invoices (PDFKit) |
| 📧 **Email Invoices** | Send invoices directly to clients via Nodemailer |
| 📊 **Analytics Dashboard** | Revenue charts, status breakdown, monthly trends (Recharts) |
| 🔄 **Status Tracking** | Draft → Sent → Paid / Overdue / Cancelled lifecycle |
| 🌙 **Dark / Light Mode** | Full theme support with CSS variables, persisted to localStorage |
| 📱 **Responsive** | Works on desktop, tablet, and mobile |

---

## 🖥️ Screenshots

<table>
  <tr>
    <td align="center"><b>Dashboard</b></td>
    <td align="center"><b>Invoice List</b></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/dashboard.png" alt="Dashboard" width="420"/></td>
    <td><img src="docs/screenshots/invoices.png" alt="Invoices" width="420"/></td>
  </tr>
  <tr>
    <td align="center"><b>Create Invoice</b></td>
    <td align="center"><b>Invoice Detail + PDF</b></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/create-invoice.png" alt="Create Invoice" width="420"/></td>
    <td><img src="docs/screenshots/invoice-detail.png" alt="Invoice Detail" width="420"/></td>
  </tr>
</table>

---

## 🏗️ Project Structure

```
invoice-app/
├── backend/                        # Express + Node.js API
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js       # Register, login, profile
│   │   ├── clientController.js     # Client CRUD
│   │   ├── invoiceController.js    # Invoice CRUD + PDF + email
│   │   └── dashboardController.js  # Analytics & aggregated stats
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT protect middleware
│   │   └── errorMiddleware.js      # Global error handler
│   ├── models/
│   │   ├── User.js                 # User schema (bcrypt hashing)
│   │   ├── Client.js               # Client schema
│   │   ├── Item.js                 # Products/services catalog
│   │   └── Invoice.js              # Invoice + line items (auto-totals)
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── clientRoutes.js
│   │   ├── invoiceRoutes.js
│   │   ├── itemRoutes.js
│   │   └── dashboardRoutes.js
│   ├── utils/
│   │   ├── generatePDF.js          # PDFKit invoice renderer
│   │   └── sendEmail.js            # Nodemailer email utility
│   ├── .env.example
│   ├── package.json
│   └── server.js                   # App entry point
│
└── frontend/                       # React 18 SPA
    └── src/
        ├── components/
        │   └── common/
        │       └── Layout.jsx       # Sidebar navigation + Outlet
        ├── context/
        │   ├── AuthContext.jsx      # Global auth state (JWT)
        │   └── ThemeContext.jsx     # Dark/light theme
        ├── pages/
        │   ├── Dashboard.jsx        # KPIs, revenue chart, recent invoices
        │   ├── InvoicesPage.jsx     # Invoice list with filters & pagination
        │   ├── CreateInvoice.jsx    # New invoice form with live totals
        │   ├── EditInvoice.jsx      # Edit existing invoice
        │   ├── InvoiceDetail.jsx    # View, PDF download, email, status
        │   ├── ClientsPage.jsx      # Client directory with modal CRUD
        │   ├── ItemsPage.jsx        # Item catalog with modal CRUD
        │   ├── LoginPage.jsx        # Login page
        │   └── ProfilePage.jsx      # Account & business settings
        ├── styles/
        │   └── global.css           # CSS variables + component styles
        ├── utils/
        │   └── api.js               # Axios instance + interceptors
        └── App.jsx                  # Router + context providers
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** (local) or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- **npm** or **yarn**
- A Gmail account (for email sending via App Passwords)

---

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/invoice-app.git
cd invoice-app
```

---

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/invoice_app
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=30d

# Email (Gmail with App Password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM=InvoiceApp <noreply@invoiceapp.com>

FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Install dependencies and start the server:

```bash
npm install
npm run dev        # starts on http://localhost:5000
```

---

### 3. Configure the frontend

```bash
cd ../frontend
npm install
npm start          # starts on http://localhost:3000
```

> The React dev server proxies `/api/*` to `localhost:5000` automatically (configured in `package.json`).

---

### 4. Open the app

Visit **http://localhost:3000**, register an account, and start creating invoices!

---

## 📡 API Reference

### Auth

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/register` | Public | Register new user |
| `POST` | `/api/auth/login` | Public | Login, receive JWT |
| `GET`  | `/api/auth/profile` | Private | Get current user |
| `PUT`  | `/api/auth/profile` | Private | Update profile/settings |

### Clients

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`    | `/api/clients` | List clients (supports `?search=`) |
| `POST`   | `/api/clients` | Create client |
| `GET`    | `/api/clients/:id` | Get client + recent invoices |
| `PUT`    | `/api/clients/:id` | Update client |
| `DELETE` | `/api/clients/:id` | Delete client |

### Invoices

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`    | `/api/invoices` | List invoices (filter by `?status=`, `?search=`, `?page=`) |
| `POST`   | `/api/invoices` | Create invoice with line items |
| `GET`    | `/api/invoices/:id` | Get full invoice detail |
| `PUT`    | `/api/invoices/:id` | Update invoice |
| `DELETE` | `/api/invoices/:id` | Delete invoice |
| `PATCH`  | `/api/invoices/:id/status` | Update status (draft/sent/paid/overdue/cancelled) |
| `GET`    | `/api/invoices/:id/pdf` | Stream PDF download |
| `POST`   | `/api/invoices/:id/email` | Email invoice to client |

### Items / Catalog

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`    | `/api/items` | List all items |
| `POST`   | `/api/items` | Create item |
| `PUT`    | `/api/items/:id` | Update item |
| `DELETE` | `/api/items/:id` | Delete item |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard` | Revenue totals, overdue, outstanding, monthly chart data |

---

## 🗃️ Data Models

### Invoice

```js
{
  user:         ObjectId,          // owner
  client:       ObjectId,          // ref: Client
  invoiceNumber: "INV-00001",      // auto-generated
  invoiceDate:  Date,
  dueDate:      Date,
  status:       "draft|sent|paid|overdue|cancelled",
  lines: [{
    name, description, quantity, price, unit,
    taxRate,   // per-line tax %
    subtotal, taxAmount, total   // server-computed
  }],
  subtotal, taxAmount,             // server-computed
  discount, discountPct,           // flat or %
  total, amountPaid, balanceDue,   // server-computed
  currency:  "USD",
  notes, terms,
  emailedAt, paidAt
}
```

### Client

```js
{
  user: ObjectId,
  name, email, phone, company,
  address, city, state, zip, country,
  notes
}
```

### Item

```js
{
  user: ObjectId,
  name, description,
  price, unit,        // hrs | pcs | days | months | flat …
  taxRate, category
}
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 18 + React Router v6 |
| State management | Context API + useReducer |
| HTTP client | Axios (with request/response interceptors) |
| Charts | Recharts (AreaChart, bar) |
| Backend framework | Express.js 4 |
| Database | MongoDB + Mongoose 7 |
| Authentication | JWT + bcryptjs |
| PDF generation | PDFKit |
| Email | Nodemailer |
| Validation | express-validator |
| Styling | Pure CSS with CSS custom properties (variables) |
| Fonts | DM Sans + DM Mono (Google Fonts) |

---

## 🔒 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret key for signing JWTs |
| `JWT_EXPIRE` | ✅ | Token expiry (e.g. `30d`) |
| `EMAIL_HOST` | ✅ | SMTP host (e.g. `smtp.gmail.com`) |
| `EMAIL_PORT` | ✅ | SMTP port (e.g. `587`) |
| `EMAIL_USER` | ✅ | SMTP username |
| `EMAIL_PASS` | ✅ | SMTP password / app password |
| `EMAIL_FROM` | ✅ | From address for outgoing mail |
| `FRONTEND_URL` | ✅ | Allowed CORS origin |
| `PORT` | ➖ | Server port (default: `5000`) |
| `NODE_ENV` | ➖ | `development` or `production` |

---

## 📧 Gmail App Password Setup

To enable email sending via Gmail:

1. Enable **2-Factor Authentication** on your Google account
2. Go to **Google Account → Security → App Passwords**
3. Select app: **Mail**, device: **Other** → name it `InvoiceApp`
4. Copy the generated 16-character password
5. Paste it as `EMAIL_PASS` in your `.env`

---

## 📦 Production Build

```bash
# 1. Build the React frontend
cd frontend && npm run build

# 2. Serve static files from Express
# Add to backend/server.js:
```

```js
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'))
);
```

```bash
# 3. Start production server
cd backend && NODE_ENV=production node server.js
```

---

## 🧪 Running Tests

```bash
# Backend unit tests (add Jest or Mocha)
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

> Test setup is not included by default. Add your preferred testing library (Jest, Supertest, React Testing Library).

---

## 🗺️ Roadmap

- [ ] Recurring invoices (weekly / monthly auto-generation)
- [ ] Stripe / PayPal payment integration
- [ ] Invoice templates (multiple PDF themes)
- [ ] Multi-currency real-time exchange rates
- [ ] Team accounts (multi-user with roles)
- [ ] Client portal (clients can view & pay their invoices)
- [ ] Expense tracking
- [ ] CSV / Excel export

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please make sure your code follows the existing style and all existing functionality continues to work.

---

## 🐛 Bug Reports

Found a bug? [Open an issue](https://github.com/yourusername/invoice-app/issues) with:
- Steps to reproduce
- Expected vs actual behaviour
- Screenshots if applicable
- Browser / Node.js version

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- [PDFKit](http://pdfkit.org/) — PDF generation
- [Nodemailer](https://nodemailer.com/) — Email delivery
- [Recharts](https://recharts.org/) — React charts
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) — Cloud database
- [Google Fonts](https://fonts.google.com/) — DM Sans & DM Mono typefaces

---

<div align="center">

Made with ❤️ using the MERN Stack

⭐ Star this repo if you found it useful!

</div>
