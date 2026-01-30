# Crimping_demo

An Electron application with React and TypeScript

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
$ yarn
```

### Development

```bash
$ yarn dev
```

### Build

```bash
# For windows
$ yarn build:win

# For macOS
$ yarn build:mac

# For Linux
$ yarn build:linux
```

taping_demo
An Electron application with React and TypeScript, optimized for high-performance desktop development and pre-configured with modern UI tools.

🚀 Tech Stack
Framework: Electron-Vite

Frontend: React 19+ + TypeScript

Styling: Tailwind CSS v4

UI Components: Shadcn/UI

Icons: Lucide React

🛠 Recommended IDE Setup
VSCode

ESLint

Prettier

Tailwind CSS IntelliSense

📁 Project Structure
Plaintext

├── src
│ ├── main # Electron Main Process (Node.js/System logic)
│ ├── preload # Context Bridge (Security layer)
│ └── renderer # React UI (Vite + Tailwind)
│ └── src
│ ├── assets # Global CSS and Tailwind imports
│ ├── components # UI Components (Shadcn)
│ └── lib # Shared utilities (cn helper)
├── electron.vite.config.ts # Core build configuration
└── components.json # Shadcn CLI configuration
⚙️ Project Setup
Install
This project requires Node 22.13.0. Ensure your environment matches the .nvmrc file.

Bash

$ yarn
Development
Starts the Vite dev server for the renderer and launches the Electron application.

Bash

$ yarn dev
Build
Generates a production-ready executable for your specific platform.

Bash

# For windows

$ yarn build:win

# For macOS

$ yarn build:mac

# For Linux

$ yarn build:linux
💅 UI Components (Shadcn)
This template uses Yarn Berry (v4). To add new components, use the dlx command:

Bash

$ yarn dlx shadcn@latest add [component-name]
[!IMPORTANT] CLI Workaround: Because this project uses electron.vite.config.ts, the Shadcn CLI may fail to detect the framework. If this happens:

Copy electron.vite.config.ts to a new file named vite.config.ts.

Run the add command.

Delete the temporary vite.config.ts.

🔒 Path Aliases
To keep imports clean and maintainable, the following aliases are pre-configured:

@/_ → Points to src/renderer/src/_ (Used by Shadcn).

@renderer/_ → Points to src/renderer/src/_ (Standard Electron-Vite).

Created as a starting template for future Electron projects.

Pro-Tip for your GitHub Repo:
Before you push this to GitHub, make sure your .gitignore includes these lines so you don't upload unnecessary "junk" files:

Plaintext

# Build artifacts

dist
out
_.exe
_.dmg
\*.AppImage

# Dependencies

node_modules
.pnp\*
.yarn/cache

# Temporary files

vite.config.ts
