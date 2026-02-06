import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { hash } from 'bcryptjs';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const args = process.argv.slice(2);
  const flags: Record<string, string> = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    flags[key] = args[i + 1];
  }

  if (!flags.email || !flags.password) {
    console.error('Usage: npx tsx scripts/create-user.ts --email <email> --password <password> [--name <name>] [--role ADMIN|USER]');
    process.exit(1);
  }

  const hashedPassword = await hash(flags.password, 12);

  const user = await prisma.user.create({
    data: {
      email: flags.email,
      name: flags.name || null,
      password: hashedPassword,
      role: (flags.role as 'ADMIN' | 'USER') || 'USER',
    },
  });

  console.log(`Created user: ${user.email} (${user.role})`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error creating user:', e.message);
    await prisma.$disconnect();
    process.exit(1);
  });
