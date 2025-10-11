# ⚡ RestBolt

**Fast, local-first REST API client for developers**

RestBolt is a modern, lightning-fast API testing tool built for developers who are tired of slow, bloated alternatives. With powerful features like visual chain building, smart variable extraction, and a beautiful dark-mode interface, RestBolt makes API testing a joy.

---

## 🌟 Why RestBolt?

**The Problem:** Existing API clients (Postman, Insomnia) are slow, bloated, and force you into cloud-first workflows. They take seconds to launch, consume hundreds of megabytes of RAM, and constantly push you to sign in.

**The Solution:** RestBolt is built from the ground up to be:
- ⚡ **Lightning Fast** - Launches instantly, runs smoothly
- 🏠 **Local-First** - Everything stored locally by default, works 100% offline
- 🎨 **Beautiful** - Modern, clean interface with seamless dark mode
- ⌨️ **Keyboard-First** - Professional keyboard shortcuts for power users
- 🔗 **Chain Builder** - Visual workflow editor for multi-step API testing (our killer feature!)

---

## ✨ Key Features

### Core API Testing
- ✅ **All HTTP Methods** - GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
- ✅ **Request Builder** - Headers, query params, request body with Monaco editor
- ✅ **Response Viewer** - Formatted JSON/XML/HTML with syntax highlighting
- ✅ **Collections** - Organize requests into folders
- ✅ **Request History** - Never lose a request
- ✅ **Environment Variables** - Multiple environments with variable substitution

### Advanced Features
- 🔗 **Chain Builder** - Create multi-step request workflows with visual editor
- 📊 **Variable Extraction** - Extract values from responses using JSONPath
- 🔄 **Variable Interpolation** - Use extracted variables in subsequent requests
- ⚠️ **Conflict Detection** - Prevents accidental variable overwrites
- 🔍 **Response Diffing** - Compare responses side-by-side
- 🌐 **WebSocket Support** - Test real-time connections
- 📝 **Code Generation** - Export to cURL, JavaScript, Python, Axios
- 🔎 **Global Search** - Find any request instantly
- 💾 **Export/Import** - Backup and share your collections

### Professional UX
- 🎨 **Dark/Light Mode** - Seamless theme switching
- 📐 **Resizable Panels** - Customize your workspace
- ⌨️ **Keyboard Shortcuts** - Cmd+B, Cmd+Enter, and more
- 💾 **Auto-Save** - Never lose your work
- 🎯 **Smart Defaults** - Sensible defaults that just work
- ✨ **Visual Feedback** - Clear loading states and status indicators

---

## 🎥 Demo

*Coming soon - demo video and screenshots*

**Key Workflows to Showcase:**
1. Simple GET request → formatted response
2. Chain Builder: Create user → Create post → Fetch post (showing variable flow)
3. Variable extraction from response
4. Code generation export
5. Response comparison

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/Dancode-188/restbolt.git
cd restbolt

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Quick Start Guide

1. **Send Your First Request**
   - Enter a URL (try `https://jsonplaceholder.typicode.com/posts/1`)
   - Click "Send" or press `Cmd/Ctrl + Enter`
   - View formatted response

2. **Create a Collection**
   - Click "Collections" tab in sidebar
   - Click "New Collection"
   - Save requests for later

3. **Try the Chain Builder** (The Cool Part!)
   - Click "Chains" tab in sidebar
   - Click "New Chain"
   - Add multiple steps
   - Extract variables from responses (e.g., `userId = $.id`)
   - Use variables in next steps (e.g., `/users/{{userId}}/posts`)
   - Execute and watch variables flow through the chain!

---

## 🔗 Chain Builder - Our Killer Feature

The **Chain Builder** is what makes RestBolt special. It lets you create visual, multi-step API workflows where data flows automatically between requests.

### Example Use Case: User Onboarding Flow

```
Step 1: Create User
  POST /api/users
  Extract: userId = $.id

Step 2: Create Profile  
  POST /api/profiles
  Body: { "userId": {{userId}}, "bio": "..." }
  Extract: profileId = $.id

Step 3: Upload Avatar
  POST /api/avatars
  Body: { "profileId": {{profileId}}, "image": "..." }

Step 4: Verify Setup
  GET /api/users/{{userId}}/complete
```

**Features:**
- Visual step-by-step editor
- JSONPath-based variable extraction
- Variable interpolation in URLs, headers, and body
- Conflict detection (warns if overwriting variables)
- Execution history tracking
- Continue-on-error handling
- Delay between steps
- Export/import chains

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **State Management:** Zustand
- **UI:** Tailwind CSS
- **Code Editor:** Monaco Editor (VS Code editor)
- **HTTP Client:** Axios
- **Local Storage:** Dexie.js (IndexedDB wrapper)
- **Resizable Panels:** react-resizable-panels
- **Keyboard Shortcuts:** react-hotkeys-hook

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Enter` | Send request |
| `Cmd/Ctrl + B` | Toggle sidebar |
| `Cmd/Ctrl + K` | Focus URL bar |
| `Cmd/Ctrl + Shift + ?` | Show all shortcuts |
| `Cmd/Ctrl + ,` | Open settings |
| `Esc` | Close modals |

---

## 📁 Project Structure

```
restbolt/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   │   ├── ChainBuilder.tsx
│   │   ├── ChainManager.tsx
│   │   ├── RequestBuilder.tsx
│   │   ├── ResponseViewer.tsx
│   │   └── ...
│   ├── lib/              # Services and utilities
│   │   ├── chain-service.ts
│   │   ├── http-client.ts
│   │   ├── db.ts
│   │   └── ...
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
└── package.json
```

---

## 🎯 Roadmap

See [GitHub Issues](https://github.com/Dancode-188/restbolt/issues) for planned features:

- [ ] GraphQL support with dedicated query builder
- [ ] Mock server for API simulation
- [ ] Automated testing framework
- [ ] Request scripting (pre/post-request scripts)
- [ ] Team collaboration features
- [ ] Cloud sync (optional)
- [ ] Desktop app (Tauri packaging)
- [ ] Plugin system

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report Bugs** - Open an issue with details
2. **Suggest Features** - Open an issue with your idea
3. **Submit PRs** - Fork, create a feature branch, and submit a PR
4. **Improve Docs** - Help us make the documentation better
5. **Spread the Word** - Share RestBolt with other developers

### Development Setup

```bash
# Fork and clone the repo
git clone https://github.com/YOUR_USERNAME/restbolt.git
cd restbolt

# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 💬 Support & Community

- **Issues:** [GitHub Issues](https://github.com/Dancode-188/restbolt/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Dancode-188/restbolt/discussions)
- **Email:** dancode.188@gmail.com (replace with your email if you want)

---

## 🙏 Acknowledgments

Built with ❤️ by developers who were tired of slow, bloated API clients.

Special thanks to:
- Next.js team for the amazing framework
- Monaco Editor for the beautiful code editor
- The open-source community for incredible libraries

---

## ⭐ Star Us!

If you find RestBolt useful, please consider giving it a star on GitHub! It helps others discover the project.

---

**RestBolt - Fast, local-first API testing for developers who care about speed and simplicity.**
