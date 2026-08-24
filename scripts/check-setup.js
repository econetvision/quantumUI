#!/usr/bin/env node

/**
 * QuantumUI Setup Verification Script
 * Checks if all prerequisites are met before running the app
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('\n🌌 QuantumUI Setup Verification\n');
console.log('='.repeat(50));

let allChecksPassed = true;

// Check 1: Node.js version
console.log('\n✓ Checking Node.js version...');
const nodeVersion = process.version;
const nodeMajor = parseInt(nodeVersion.split('.')[0].substring(1));
if (nodeMajor >= 18) {
  console.log(`  ✅ Node.js ${nodeVersion} (>= 18 required)`);
} else {
  console.log(`  ❌ Node.js ${nodeVersion} (upgrade to >= 18)`);
  allChecksPassed = false;
}

// Secrets moved to .env.local, which the Prisma CLI does not auto-load (it
// reads .env only). Parse it into process.env so the db-connection probe below
// inherits DATABASE_URL when it shells out.
for (const file of ['.env.local', '.env']) {
  const p = path.join(__dirname, '..', file);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, 'utf-8').split('\n')) {
    const m = line.match(/^[ \t]*([A-Z_][A-Z0-9_]*)[ \t]*=[ \t]*(.*)$/);
    if (!m) continue;
    const value = m[2].trim().replace(/^["']|["']$/g, '');
    if (value && !(m[1] in process.env)) process.env[m[1]] = value;
  }
}

// Check 2: Environment files
//
// Secrets live in .env.local, not .env — .env holds only non-secret defaults.
// Both are read (Next.js merges them, .env.local winning), so a value in
// either one counts as set.
console.log('\n✓ Checking environment files...');
const envLocalPath = path.join(__dirname, '..', '.env.local');
const envPath = path.join(__dirname, '..', '.env');

const readIfPresent = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : '');
const envContent = readIfPresent(envLocalPath) + '\n' + readIfPresent(envPath);

if (fs.existsSync(envLocalPath)) {
  console.log('  ✅ .env.local exists (secrets)');
} else {
  console.log('  ❌ .env.local not found — this is where secrets go');
  console.log('     Run: cp .env.example .env.local  (then fill in the values)');
  allChecksPassed = false;
}

// AUTH_SECRET is the NextAuth v5 name; NEXTAUTH_SECRET is the v4 fallback that
// src/lib/auth.ts still accepts, so either satisfies the check.
const requiredVars = [
  ['DATABASE_URL'],
  ['AUTH_SECRET', 'NEXTAUTH_SECRET'],
];
// [ \t] rather than \s: \s matches newlines, so `KEY=` followed by a blank
// line swallowed the break and tested the *next* assignment for emptiness,
// reporting empty vars as set.
const isSet = (name) =>
  new RegExp(`^[ \t]*${name}[ \t]*=[ \t]*(?!$|""|'')`, 'm').test(envContent);

const missingVars = requiredVars
  .filter((names) => !names.some(isSet))
  .map((names) => names.join(' or '));

if (missingVars.length === 0) {
  console.log('  ✅ All required environment variables set');
} else {
  console.log(`  ⚠️  Missing or empty: ${missingVars.join(', ')}`);
  console.log('     Add them to .env.local');
}

// Optional, but sign-in with Google silently falls back to password-only
// without them — worth surfacing rather than debugging at the login screen.
if (isSet('AUTH_GOOGLE_ID') && isSet('AUTH_GOOGLE_SECRET')) {
  console.log('  ✅ Google OAuth configured');
} else {
  console.log('  ℹ️  Google OAuth not configured (optional)');
  console.log('     Add AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET to .env.local');
}

// Check 3: MySQL connection
console.log('\n✓ Checking PostgreSQL...');
try {
  execSync('npx prisma db execute --stdin < /dev/null', { stdio: 'ignore' });
  console.log('  ✅ Database connection successful');
} catch {
  console.log('  ⚠️  Cannot connect to the database');
  console.log('     DATABASE_URL must point at PostgreSQL — the schema declares');
  console.log('     provider = "postgresql". Start one with:');
  console.log('       docker compose up -d db      (recommended)');
  console.log('       brew services start postgresql@16');
  console.log('     Then: npm run db:push');
}

// Check 4: Prisma client
console.log('\n✓ Checking Prisma client...');
const prismaClientPath = path.join(__dirname, '..', 'node_modules', '@prisma', 'client');
if (fs.existsSync(prismaClientPath)) {
  console.log('  ✅ Prisma client generated');
} else {
  console.log('  ❌ Prisma client not generated');
  console.log('     Run: npm run db:generate');
  allChecksPassed = false;
}

// Check 5: QWorld content
console.log('\n✓ Checking QWorld content...');
const qworldRepos = ['qbook101', 'silver-qcourse511', 'qec', 'qkd'];
const parentDir = path.join(__dirname, '..', '..');
const foundRepos = qworldRepos.filter(repo => {
  return fs.existsSync(path.join(parentDir, repo));
});

if (foundRepos.length === qworldRepos.length) {
  console.log(`  ✅ All QWorld repos found (${foundRepos.length}/4)`);
} else {
  console.log(`  ⚠️  Found ${foundRepos.length}/4 QWorld repos`);
  const missing = qworldRepos.filter(r => !foundRepos.includes(r));
  console.log(`     Missing: ${missing.join(', ')}`);
  console.log('     Seeding will only populate available content');
}

// Check 6: Dependencies
console.log('\n✓ Checking npm dependencies...');
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('  ✅ Dependencies installed');
} else {
  console.log('  ❌ Dependencies not installed');
  console.log('     Run: npm install');
  allChecksPassed = false;
}

// Summary
console.log('\n' + '='.repeat(50));
if (allChecksPassed) {
  console.log('\n✨ All checks passed! You\'re ready to start.\n');
  console.log('Next steps:');
  console.log('  1. npm run db:push     # Create database tables');
  console.log('  2. npm run db:seed     # Import QWorld content');
  console.log('  3. npm run dev         # Start development server\n');
} else {
  console.log('\n⚠️  Some checks failed. Fix the issues above and try again.\n');
  process.exit(1);
}
