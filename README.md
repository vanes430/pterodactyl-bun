# Pterodactyl Panel (Bun Hard Fork)

<p align="center">
  <img src="https://cdn.pterodactyl.io/logos/new/pterodactyl_logo_transparent.png" width="400" alt="Pterodactyl Panel">
</p>

## ⚠️ About This Fork

This is a **Hard Fork** of the [Pterodactyl Panel](https://github.com/pterodactyl/panel). 

**What makes this fork different?**
- **Modern UI**: Full Glassmorphism theme, Inter font, and [Lucide React](https://lucide.dev/) icons.
- **Enhanced UX**: Skeleton loading, modern Toast notifications, and Fullscreen Terminal.
- **Bun Optimized**: The entire frontend build system has been migrated to [Bun](https://bun.sh/) for near-instant compilation and improved developer experience.

---

## 📦 Installation (Standard Pterodactyl)

This fork follows the standard Pterodactyl installation procedure. You should follow the [official documentation](https://pterodactyl.io/panel/1.0/getting_started.html) for web server and database configuration.

### 1. Requirements
- PHP `8.2` or `8.3` (with extensions: `cli`, `openssl`, `gd`, `mysql`, `PDO`, `mbstring`, `tokenizer`, `bcmath`, `xml` or `dom`, `curl`, `zip`, and `fpm`)
- MySQL `8.0+` or MariaDB `10.6+`
- Redis Server
- A Webserver (Nginx or Apache)
- **Bun** (Required for asset compilation)

### 2. Download & Install
```bash
# Create directory
mkdir -p /var/www/pterodactyl
cd /var/www/pterodactyl

# Clone this repo or download the release
git clone https://github.com/your-username/pterodactyl-bun.git .

# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Setup environment
cp .env.example .env
php artisan key:generate
```

### 3. Database & Permissions
Follow the standard steps for database setup and permissioning as outlined in the official docs.

### 4. Compile Assets
Unlike the original panel which uses Yarn/Webpacker, this fork uses **Bun**.
```bash
# Install Bun (if not present)
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Build the panel
bun install
bun run build:prod
```

---

## 🛠️ Local Development

If you want to modify the UI or contribute to the development of this fork:

### 🚀 Development Workflow
```bash
# 1. Install dependencies
bun install

# 2. Start the watcher (Auto-rebuild on changes)
bun run watch

# 3. Access UI Laboratory
# Visit http://your-panel.test/dev/playground
# This route is only accessible when process.env.NODE_ENV is 'development'.
```

### 🏗️ Flexible Build Modes
We provide three specialized build modes via Bun:

| Command | Target | Features |
| :--- | :--- | :--- |
| `bun run package:dev` | Debugging | No Minify, No Hashing, Source Maps enabled. |
| `bun run package:dev-hash` | Staging | No Minify, Filename Hashing enabled (Production structure). |
| `bun run package:prod` | Production | Full Minification, Hashing, and Code Optimization. |

### ✨ UI Components
This fork uses a modernized stack:
- **Icons**: Lucide React (Standardized across the panel).
- **Styling**: Tailwind CSS + Styled Components + Twin.Macro.
- **Avatars**: DiceBear API with local SVG fallback.
- **Notifications**: react-hot-toast.

---

## 📜 License
Pterodactyl Panel is licensed under the [MIT License](https://opensource.org/licenses/MIT).
