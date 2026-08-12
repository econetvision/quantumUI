/**
 * Create the starting accounts.
 *
 * Kept separate from `seed.ts` (which imports course content) so that resetting
 * content does not wipe accounts, and so credentials are only ever created by
 * an explicit, deliberate command.
 *
 * Run with: npm run db:seed:users
 */

import { PrismaClient, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Seed accounts.
 *
 * Credentials come from the environment so a production seed never inherits the
 * weak local defaults. The fallbacks exist purely so `npm run db:seed:users`
 * works out of the box on a fresh checkout.
 */
const ACCOUNTS = [
  {
    name: "Admin",
    email: process.env.SEED_ADMIN_EMAIL ?? "admin@quantumui.local",
    password: process.env.SEED_ADMIN_PASSWORD ?? "admin1234",
    role: UserRole.ADMIN,
  },
  {
    name: "Demo Student",
    email: process.env.SEED_STUDENT_EMAIL ?? "student@quantumui.local",
    password: process.env.SEED_STUDENT_PASSWORD ?? "student1234",
    role: UserRole.FREE,
  },
];

const USING_DEFAULTS =
  !process.env.SEED_ADMIN_PASSWORD || !process.env.SEED_STUDENT_PASSWORD;

async function main() {
  console.log("👤 Creating accounts...\n");

  for (const account of ACCOUNTS) {
    const passwordHash = await hash(account.password, 12);

    const user = await prisma.user.upsert({
      where: { email: account.email },
      // Reset the password on re-run so a forgotten local password is
      // recoverable by simply re-seeding.
      update: { password: passwordHash, role: account.role, name: account.name },
      create: {
        name: account.name,
        email: account.email,
        password: passwordHash,
        role: account.role,
      },
    });

    console.log(`  ✓ ${user.role.padEnd(6)} ${account.email}  (password: ${account.password})`);
  }

  if (USING_DEFAULTS) {
    console.log(
      "\n  ⚠️  Using the built-in development passwords. Set SEED_ADMIN_PASSWORD and",
    );
    console.log(
      "     SEED_STUDENT_PASSWORD before seeding anything reachable from the internet.",
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
