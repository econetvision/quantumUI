# 🚀 QuantumUI - MySQL Setup Guide

This project uses **MySQL** as the database (optimized for user progress tracking, relationships, and ACID compliance).

---

## 📦 Option 1: Install MySQL Locally (Recommended for Development)

### Step 1: Install MySQL

```bash
# macOS - Install via Homebrew
brew install mysql

# Start MySQL service
brew services start mysql

# Verify it's running
brew services list | grep mysql
```

### Step 2: Secure MySQL Installation (Optional but Recommended)

```bash
# Run security script
mysql_secure_installation

# Follow prompts:
# - Set root password: YES (choose a strong password)
# - Remove anonymous users: YES
# - Disallow root login remotely: YES
# - Remove test database: YES
# - Reload privilege tables: YES
```

### Step 3: Create Database

```bash
# Login to MySQL
mysql -u root -p
# Enter the password you set above

# Create database
CREATE DATABASE quantumui CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Verify it was created
SHOW DATABASES;

# Exit MySQL
EXIT;
```

### Step 4: Configure Environment

Copy and edit `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:

```bash
# MySQL Connection String
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/quantumui"

# NextAuth Secret (generate: openssl rand -base64 32)
NEXTAUTH_SECRET="paste-your-generated-secret-here"

NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

**Replace `YOUR_PASSWORD` with your MySQL root password.**

---

## 🌐 Option 2: Use PlanetScale (Free Cloud MySQL)

PlanetScale offers a **free tier** with 5GB storage - perfect for development!

### Step 1: Create Free Account

1. Go to https://planetscale.com
2. Sign up for free account
3. Click **"Create a new database"**
4. Name: `quantumui`
5. Region: Choose closest to you
6. Click **"Create database"**

### Step 2: Get Connection String

1. Click **"Connect"**
2. Select **"Prisma"** from dropdown
3. Copy the connection string shown
4. It looks like: `mysql://user:pass@aws.connect.psdb.cloud/quantumui?sslaccept=strict`

### Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```bash
# Paste PlanetScale connection string
DATABASE_URL="mysql://user:pass@aws.connect.psdb.cloud/quantumui?sslaccept=strict"

# Generate secret: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret"

NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

**Note**: PlanetScale doesn't support foreign key constraints, which is why we use `relationMode = "prisma"` in schema.

---

## 🐳 Option 3: Use Docker (No Installation Required)

Run MySQL in a Docker container:

### Step 1: Install Docker Desktop

Download from https://www.docker.com/products/docker-desktop/

### Step 2: Start MySQL Container

```bash
# Create and start MySQL container
docker run --name quantumui-mysql \
  -e MYSQL_ROOT_PASSWORD=quantumui123 \
  -e MYSQL_DATABASE=quantumui \
  -p 3306:3306 \
  -d mysql:8.0

# Verify it's running
docker ps
```

### Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```bash
DATABASE_URL="mysql://root:quantumui123@localhost:3306/quantumui"

NEXTAUTH_SECRET="generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### Docker Commands:

```bash
# Stop container
docker stop quantumui-mysql

# Start container
docker start quantumui-mysql

# Remove container (data will be lost!)
docker rm -f quantumui-mysql

# Access MySQL shell
docker exec -it quantumui-mysql mysql -u root -p
```

---

## 🚀 Initialize Database (All Options)

Once MySQL is set up, run these commands:

```bash
# 1. Verify setup
npm run setup

# 2. Generate Prisma client
npm run db:generate

# 3. Create database tables
npm run db:push

# 4. Seed with QWorld content
npm run db:seed

# 5. Start development server
npm run dev
```

---

## ✅ Verify MySQL is Working

### Check MySQL is Running:

**Option 1 (Local):**
```bash
mysql -u root -p -e "SELECT 1;"
```

**Option 2 (PlanetScale):**
```bash
# Connection works if db:push succeeds
npm run db:push
```

**Option 3 (Docker):**
```bash
docker exec quantumui-mysql mysql -u root -pquantumui123 -e "SELECT 1;"
```

### Check Database Tables:

```bash
# Open Prisma Studio (visual database browser)
npm run db:studio

# Opens http://localhost:5555
# You should see: User, Track, Lab, Question, etc.
```

---

## 🔧 Troubleshooting

### ❌ "Error: P1001: Can't reach database server"

**Solution 1 - MySQL not running:**
```bash
# Local MySQL
brew services start mysql

# Docker
docker start quantumui-mysql
```

**Solution 2 - Wrong credentials:**
```bash
# Test connection manually
mysql -u root -p

# If fails, reset password:
mysql -u root
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
```

### ❌ "Access denied for user 'root'@'localhost'"

Update your `.env` with correct password:
```bash
DATABASE_URL="mysql://root:YOUR_ACTUAL_PASSWORD@localhost:3306/quantumui"
```

### ❌ "Unknown database 'quantumui'"

Create the database:
```bash
mysql -u root -p -e "CREATE DATABASE quantumui;"
```

### ❌ "Error: P3014: Prisma Migrate could not create the shadow database"

Add this to your connection string:
```bash
DATABASE_URL="mysql://root:password@localhost:3306/quantumui?socket=/tmp/mysql.sock"
```

### ❌ Port 3306 already in use

Another MySQL instance is running:
```bash
# Find process
lsof -ti:3306

# Kill it
lsof -ti:3306 | xargs kill -9

# Or use different port
docker run -p 3307:3306 ...
# Then update DATABASE_URL to use 3307
```

---

## 📊 Why MySQL for This Project?

| Feature | Why It Matters |
|---------|---------------|
| **ACID Transactions** | User XP, streaks, progress must be consistent |
| **Foreign Keys** | Prevents orphaned labs, progress, attempts |
| **Joins** | Efficient queries: User → Progress → Track → Lab |
| **Indexes** | Fast lookups for leaderboards, analytics |
| **Prisma Support** | Type-safe queries, migrations, schema sync |

---

## 🎯 Quick Start Commands

```bash
# Local MySQL Setup
brew install mysql
brew services start mysql
mysql -u root -p -e "CREATE DATABASE quantumui;"

# Configure .env
DATABASE_URL="mysql://root:password@localhost:3306/quantumui"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Initialize
npm run db:generate
npm run db:push
npm run db:seed

# Run app
npm run dev
```

---

## 🌟 Recommended: PlanetScale Free Tier

**Best for beginners:**
- ✅ No installation required
- ✅ Free 5GB storage
- ✅ Automatic backups
- ✅ Web-based SQL editor
- ✅ Branch-based development
- ✅ Production-ready scaling

**Sign up**: https://planetscale.com

---

**Ready to start!** Choose your MySQL option and follow the steps above. 🚀
