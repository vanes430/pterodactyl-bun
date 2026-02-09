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
| `bun run package:prod` | Release | Production build bundled into a deployment archive. |

---

## 📜 License
Pterodactyl Panel is licensed under the [MIT License](https://opensource.org/licenses/MIT).