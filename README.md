# Pterodactyl Panel (Bun Hard Fork)

<p align="center">
  <img src="https://cdn.pterodactyl.io/logos/new/pterodactyl_logo_transparent.png" width="400" alt="Pterodactyl Panel">
</p>

## ⚠️ About This Fork

This is a **Hard Fork** of the [Pterodactyl Panel](https://github.com/pterodactyl/panel) focused on performance, modern developer experience, and a polished user interface.

### ✨ Key Features & Improvements
- **Modern UI/UX**: 
  - Full Glassmorphism theme with [Inter](https://rsms.me/inter/) font.
  - Migrated to **CodeMirror 6** for a superior editing experience with `githubDark` theme and expanded language support (TOML, Nginx, Shell, etc.).
  - **Responsive Sidebar File Explorer** with Material Design icons for faster navigation.
  - **Persistent Drag-and-Drop** server sorting on the dashboard.
- **Enhanced Performance**:
  - Optimized status polling and reduced UI noise (silenced repetitive error toasts).
  - Skeleton loading and modern toast notifications for smooth transitions.
  - Optimized bundle performance with Bun-native build system.
- **Modern Tech Stack**:
  - **React 18** & **React Router v6** for better concurrency and routing.
  - **React Hook Form** for efficient, type-safe form handling.
  - Replaced Axios with native **Fetch API** for a lighter footprint.
  - **Bun Optimized**: Near-instant compilation and improved developer experience.

---

## 📦 Installation

To install this panel, please follow the **official Pterodactyl installation guide** for all system requirements, web server configuration, and database setup:

👉 **[Official Pterodactyl Documentation](https://pterodactyl.io/panel/1.0/getting_started.html)**

### Difference in Asset Compilation
The only major difference in the installation process is the **Asset Compilation** step. Instead of using Yarn/Node, this fork uses **Bun**.

Once you have finished the official installation steps (Composer, .env, etc.), run these commands to build the frontend:

```bash
# 1. Install Bun (if not present)
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# 2. Build the panel assets
bun install
bun run build:prod
```

### ⚡ Quick Update / Reinstall
Use this script to quickly update or reinstall the panel using pre-compiled production assets. 

> [!IMPORTANT]
> **Run this script while you are in the `/var/www` directory.** 
> Ensure your existing `.env` file is safely located in `/var/www/.env` before starting.

```bash
# Forcefully remove the old panel directory
rm -rf pterodactyl
# Create a fresh directory
mkdir -p pterodactyl
# Enter the new directory
cd pterodactyl
# Download the latest pre-compiled production assets
curl -Lo panel.tar.gz https://github.com/vanes430/pterodactyl-bun/releases/download/latest/panel-prod-compress-brotli-split.tar.gz
# Extract the archive silently
tar -xzvf panel.tar.gz > /dev/null 2>&1
# Set correct permissions for storage and cache
chmod -R 755 storage/* bootstrap/cache/
# Remove the default .env file
rm .env
# Copy your existing .env from the parent directory (/var/www/.env)
cp ../.env .env
# Install PHP dependencies (Production)
composer install --no-dev --optimize-autoloader
# Clear view cache
php artisan view:clear
# Clear configuration cache
php artisan config:clear
# Set webserver ownership for all files
chown -R www-data:www-data /var/www/pterodactyl/*
# Restart queue workers
php artisan queue:restart
# Disable maintenance mode and go live
php artisan up
```

---

## 🛠️ Local Development

If you want to modify the UI or contribute to the development:

### 🚀 Development Workflow
```bash
# 1. Start the watcher (Auto-rebuild on changes)
bun run watch

# 2. Access UI Laboratory (Playground)
# Visit http://your-panel.test/dev/playground
# Note: This route is only accessible when process.env.NODE_ENV is 'development'.
```

### 🏗️ Flexible Build Modes
We provide specialized build modes via `build.ts`:

| Command | Target | Features |
| :--- | :--- | :--- |
| `bun run build:dev` | Development | No Minify, No Hashing. |
| `bun run build:prod` | Production | Full Minification, Hashing, and Optimization. |
| `bun run build:prod-compress` | Production | Full Optimization + Gzip Pre-compression. |
| `bun run build:prod-full` | Production | Full Optimization + Gzip & Brotli Pre-compression. |
| `bun run package:prod` | Release | Production build bundled into a deployment archive. |

---

## ⚡ Performance Optimization (Gzip & Brotli)

This fork supports **Gzip and Brotli Pre-compression** to significantly reduce asset sizes (up to 70-80% smaller) and improve page load speeds. Brotli typically provides even better compression than Gzip for modern browsers.

### 1. Build with Compression
To generate compressed assets (`.gz` and `.br` files), use the following commands:

```bash
# Build with Gzip only
bun run build:prod-compress

# Build with both Gzip and Brotli (Recommended for production)
bun run build:prod-full
```

### 2. Configure Nginx
To serve these pre-compressed assets without extra CPU overhead, you should enable `gzip_static` and `brotli_static` (if available) in your Nginx configuration.

Edit your site configuration (usually `/etc/nginx/sites-available/pterodactyl.conf`):

```nginx
server {
    # ... other config ...

    # Enable Gzip Compression
    gzip on;
    gzip_static on; # Tells Nginx to look for pre-compressed .gz files
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/javascript image/svg+xml;

    # Enable Brotli Compression (Requires ngx_brotli module)
    # brotli on;
    # brotli_static on; # Tells Nginx to look for pre-compressed .br files
    # brotli_comp_level 6;
    # brotli_types text/plain text/css text/xml application/javascript image/svg+xml;

    # ... other config ...
}
```

> **Note:** `brotli_static` requires the `ngx_brotli` module to be installed in Nginx. If it's not available, Nginx will fallback to Gzip or the original files.

After updating the config, test and reload Nginx:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## 📜 License
Pterodactyl Panel is licensed under the [MIT License](https://opensource.org/licenses/MIT).