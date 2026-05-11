# 🧵 Creaciones JAKD — Sistema Administrativo

Sistema web completo para la gestión de negocios de costura. Desarrollado con **React + Node.js + PostgreSQL + Prisma**.

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?logo=postgresql)

---

## ✨ Funcionalidades

- 🔐 **Autenticación JWT** — Login seguro con tokens
- 📦 **Inventario** — CRUD completo de productos, categorías, tallas y stock
- ✂️ **Arreglos** — Control de trabajos de costura con estados (Pendiente/Pagado)
- 👥 **Clientes** — Base de datos con contactos integrados
- 💳 **Deudas** — Seguimiento de pagos con abonos parciales y botón de cobro por WhatsApp
- 📊 **Dashboard** — Estadísticas en tiempo real del negocio
- 📱 **Responsive** — Diseño optimizado para celular y escritorio

---

## 🎨 Identidad Visual

| Color | Código |
|-------|--------|
| Turquesa Oscuro | `#0D7377` |
| Turquesa Claro | `#14FFEC` |
| Negro | `#1A1A1A` |

---

## 🛠️ Stack Tecnológico

**Frontend**
- React 18 + React Router DOM
- CSS Modules con variables de marca
- Lucide React (iconografía)

**Backend**
- Node.js + Express
- Prisma ORM
- PostgreSQL
- JWT + bcryptjs

---

## 🚀 Demo

&gt; *Próximamente disponible en Vercel + Render*

---

## 📦 Instalación Local

```bash
# 1. Clonar
git clone https://github.com/KarlaAcosta1205-bot/creaciones-jakd.git
cd creaciones-jakd

# 2. Backend
cd backend
npm install
npx prisma migrate dev
npm run seed
npm start

# 3. Frontend (nueva terminal)
cd ../frontend
npm install
npm start

👩‍💻 Desarrolladora
Karla Acosta — @pureset
Sound Engineering student & Full Stack Developer