const bcrypt = require('bcryptjs');
const prisma = require('./config/database');

async function seed() {
  const existing = await prisma.usuario.findFirst();
  if (existing) {
    console.log('Ya existe un usuario. Seed cancelado.');
    return;
  }

  const hashedPassword = await bcrypt.hash('jakd2026', 10);
  
  await prisma.usuario.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      nombre: 'Administrador JAKD'
    }
  });

  console.log('✅ Usuario creado: admin / jakd2026');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());