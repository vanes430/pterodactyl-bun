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
We provide three specialized build modes:

| Command | Target | Features |
| :--- | :--- | :--- |
| `bun run package:dev` | Debugging | No Minify, No Hashing, Source Maps enabled. |
| `bun run package:dev-hash` | Staging | No Minify, Filename Hashing enabled. |
| `bun run package:prod` | Production | Full Minification, Hashing, and Optimization. |

---

## 📜 License
Pterodactyl Panel is licensed under the [MIT License](https://opensource.org/licenses/MIT).