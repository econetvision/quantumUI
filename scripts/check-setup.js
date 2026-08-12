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

// Check 2: Environment file
console.log('\n✓ Checking .env file...');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  console.log('  ✅ .env file exists');

  // Check for required env vars
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const requiredVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
  const missingVars = requiredVars.filter(varName => {
    return !envContent.includes(varName) || envContent.includes(`${varName}=""`);
  });

  if (missingVars.length === 0) {
    console.log('  ✅ All required environment variables set');
  } else {
    console.log(`  ⚠️  Missing or empty: ${missingVars.join(', ')}`);
    console.log('     Edit .env and add your values');
  }
} else {
  console.log('  ❌ .env file not found');
  console.log('     Run: cp .env.example .env');
  allChecksPassed = false;
}

// Check 3: MySQL connection
console.log('\n✓ Checking MySQL...');
try {
  execSync('which mysql', { stdio: 'ignore' });
  console.log('  ✅ MySQL installed');

  // Try to connect (this will only work if DATABASE_URL is set)
  try {
    execSync('npx prisma db execute --stdin < /dev/null', { stdio: 'ignore' });
    console.log('  ✅ Database connection successful');
  } catch {
    console.log('  ⚠️  Cannot connect to database');
    console.log('     Make sure MySQL is running and DATABASE_URL is correct');
  }
} catch {
  console.log('  ⚠️  MySQL not found locally');
  console.log('     Options:');
  console.log('     1. Install locally: brew install mysql');
  console.log('     2. Use PlanetScale (free cloud MySQL)');
  console.log('     3. Use Docker: docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=pass mysql:8.0');
  console.log('     See MYSQL_SETUP.md for details');
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
