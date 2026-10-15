# Beads Viewer

A web interface for humans to interact with [Beads](https://github.com/steveyegge/beads) - the dependency-aware issue tracker made for agents.

> **🔖 Version Compatibility:** Built for Beads CLI **v0.9.6**
> If you're using a newer version of Beads, some features may not work as expected. Please check for updates or [open an issue](https://github.com/mgalpert/beads-viewer/issues).

<p align="center">
  <strong>Visual Project Management</strong> • <strong>Real-time Collaboration</strong> • <strong>Dependency Tracking</strong>
</p>

## Overview

Beads Viewer provides a full-featured web application for managing your Beads projects with:

- **Kanban Board** - Drag-and-drop interface for visual workflow management
- **Dependency Graph** - Interactive visualization of issue relationships
- **Smart Filtering** - Ready Work view shows unblocked, actionable issues
- **Real-time Sync** - WebSocket updates keep all clients in sync
- **CLI Integration** - Works seamlessly with the Beads CLI via shell commands

## Quick Start

### Prerequisites

1. **Install the Beads CLI** - Follow the [Beads installation guide](https://github.com/steveyegge/beads#installation)
2. **Install Bun** - `curl -fsSL https://bun.sh/install | bash`
3. **Initialize a Beads project** - Run `bd init` in your project directory

### Installation

```bash
# Clone the repository
git clone https://github.com/mgalpert/beads-viewer.git
cd beads-viewer

# Install dependencies
bun install

# Start the application
bun dev:full
```

Open your browser to **http://localhost:5173**

### What Just Happened?

- Frontend dev server started on port **5173**
- Backend API server started on port **3001**
- Server connected to the `bd` CLI in your current directory
- File watcher monitoring `.beads/issues.jsonl` for external changes

## Screenshots

### Issue List View
![Issue List with sortable columns](list-view.png)

### Kanban Board
![Drag-and-drop Kanban board](kanban.png)

### Dependency Graph
![Interactive dependency visualization](graph.png)

## Features

### 📋 Multiple Views

**Issue List**
- Sortable table with all your issues
- Filter by status, priority, assignee
- Click any row to view/edit details

**Kanban Board**
- Visual board with 4 columns: Open, In Progress, Blocked, Closed
- Drag-and-drop to update status
- Color-coded cards with priority indicators

**Dependency Graph**
- Interactive network visualization
- Shows blocking relationships (red animated edges)
- Related dependencies (dotted edges)
- Drag nodes to rearrange, positions are saved

**Ready Work**
- Smart filter showing only unblocked issues
- Sorted by priority, then creation date
- Perfect for "what should I work on next?"

### ✏️ Issue Management

**Create Issues**
- Click "New Issue" button in header
- Rich metadata: priority (P0-P4), type, assignee, estimated time
- Multiple content sections: Description, Design Notes, Acceptance Criteria, Notes
- Add blocking dependencies

**Edit Issues**
- Click any issue to open side panel
- View mode shows all details
- Edit mode enables inline editing
- Auto-save on close (Escape key)
- Click dependencies to navigate to related issues

**Manage Dependencies**
- Add/remove blocking dependencies
- Multiple types: blocks, related, parent-child, discovered-from
- Visual display of dependents (issues that depend on this one)
- Cycle detection to prevent dependency loops

### 🔄 Real-time Collaboration

- **WebSocket Integration** - Changes broadcast to all connected clients instantly
- **Optimistic Updates** - UI updates immediately, no waiting for server
- **Auto-reconnect** - Connection restored automatically after 5 seconds
- **External Changes** - Detects when CLI modifies files and syncs all clients

### 🔧 CLI Integration

The server **shells out to the `bd` CLI** for all operations:

```bash
bd create "New issue" --json    # Create
bd update TEST-123 --json       # Update
bd close TEST-123 --json        # Close
bd list --json                  # List
bd ready --json                 # Ready work
bd blocked --json               # Blocked issues
```

**Why?**
- Full compatibility with the Go Beads CLI
- Access to SQLite cache for fast queries (<100ms)
- Proper dependency resolution
- Both UI and CLI can be used simultaneously

## Architecture

```
┌─────────────────┐      HTTP/WS       ┌─────────────────┐    shell exec    ┌──────────────┐
│                 │ ◄──────────────────►│                 │ ◄───────────────►│              │
│  React Frontend │                     │  Express Server │                  │  `bd` CLI    │
│   (Port 5173)   │                     │   + WebSocket   │                  │   (Go)       │
│                 │                     │   (Port 3001)   │                  │              │
└─────────────────┘                     └─────────────────┘                  └──────┬───────┘
        ↑                                        ↑                                   │
        │                                        │                                   ↓
        └──────── Zustand Store ────────────────┘                          ┌────────────────┐
         (Optimistic Updates + Rollback)                                   │ SQLite + JSONL │
                                                                            │  .beads/ dir   │
                                                                            └────────────────┘
```

### Data Flow

1. **User Action** → UI (e.g., "Create Issue")
2. **Optimistic Update** → Zustand store updates immediately
3. **HTTP Request** → Express server
4. **CLI Execution** → Server runs `bd create --json ...`
5. **Persistence** → `bd` CLI updates SQLite + JSONL
6. **WebSocket Broadcast** → All clients receive update
7. **Confirmation** → Store confirms or rolls back on error

## Technology Stack

### Frontend
- **React 18** - UI framework with hooks
- **TypeScript 5.6** - Type safety
- **Vite 5.4** - Lightning-fast build tool
- **Tailwind CSS 3.4** - Utility-first styling with dark mode
- **Zustand 5.0** - Lightweight state management
- **TanStack Table 8.20** - Powerful data tables
- **React Flow 12.3** - Interactive graphs
- **@dnd-kit 6.1** - Accessible drag-and-drop
- **Lucide React** - Beautiful icons

### Backend
- **Express 5.1** - Web server
- **ws 8.18** - WebSocket server
- **Bun** - Fast JavaScript runtime
- **Beads CLI** - Go binary for data operations

### Testing
- **Vitest 3.2** - Fast unit test framework
- **Testing Library** - Component testing

## Development

### Running the Application

```bash
# Both frontend and backend together (recommended)
bun dev:full

# OR run separately:
bun run server    # Backend only (terminal 1)
bun run dev       # Frontend only (terminal 2)
```

### Testing

```bash
# Run tests in watch mode
bun test

# Run tests once (CI mode)
bun test:run

# Run tests with UI
bun test:ui
```

### Build for Production

```bash
# Type check and build
bun run build

# Preview production build
bun run preview

# Lint
bun run lint
```

### Project Structure

```
beads-viewer/
├── server/                          # Express backend
│   ├── index.ts                     # HTTP + WebSocket server
│   ├── bd-cli.test.ts               # CLI integration tests (5 tests)
│   └── utils/
│       └── bd-cli.ts                # CLI wrapper (shells out to bd)
│
├── src/                             # React frontend
│   ├── components/
│   │   ├── boards/
│   │   │   └── KanbanBoard.tsx      # Drag-and-drop Kanban
│   │   ├── graphs/
│   │   │   └── DependencyGraph.tsx  # React Flow graph
│   │   ├── issues/
│   │   │   ├── IssueList.tsx        # TanStack Table
│   │   │   ├── IssueSidePanel.tsx   # Create/view/edit
│   │   │   └── ReadyWorkView.tsx    # Ready work queue
│   │   └── layout/
│   │       ├── Header.tsx           # Top nav
│   │       └── ViewSwitcher.tsx     # View tabs
│   ├── store/
│   │   └── useIssueStore.ts         # Zustand store (optimistic updates)
│   ├── types/
│   │   └── issue.ts                 # TypeScript interfaces
│   ├── lib/
│   │   ├── jsonl.ts                 # JSONL parsing
│   │   └── utils.ts                 # Helpers
│   └── App.tsx                      # Main component
│
├── .beads/                          # Data directory (gitignored)
│   ├── issues.jsonl                 # Primary data file
│   └── *.db                         # SQLite cache
│
├── package.json                     # Dependencies & scripts
├── vite.config.ts                   # Vite configuration
├── vitest.config.ts                 # Test configuration
├── tailwind.config.js               # Tailwind CSS config
└── CLAUDE.md                        # Developer guidance for AI assistants
```

## API Reference

### REST Endpoints

```
GET    /api/health              Health check
GET    /api/issues              List all issues
GET    /api/issues/:id          Get single issue
POST   /api/issues              Create issue
PATCH  /api/issues/:id          Update issue
DELETE /api/issues/:id          Close issue
GET    /api/ready               Get ready work
GET    /api/blocked             Get blocked issues
```

### WebSocket Events

```
issue:created      New issue added
issue:updated      Issue modified
issue:deleted      Issue closed (legacy)
issues:refresh     External CLI change detected, refetch
```

## Configuration

The application uses sensible defaults and requires no configuration. For custom setups:

### Environment Variables

Create a `.env` file (optional):

```env
# Backend
PORT=3001

# Point the server at a Beads project directory (defaults to the server's cwd).
# Must contain a .beads/ store; used for both bd commands and the file watcher.
BEADS_DIR=/path/to/project

# Frontend
VITE_API_URL=http://localhost:3001/api
```

### Running against another project

```bash
BEADS_DIR=/path/to/project bun run server
```

### Port Configuration

```bash
# Custom backend port
PORT=4000 bun run server

# Custom frontend API URL
VITE_API_URL=http://localhost:4000/api bun run dev
```

## Keyboard Shortcuts

- **Escape** - Close side panel
- **Ctrl/Cmd + K** - Quick command (planned)

## Troubleshooting

### Backend won't start

**Issue:** `Error: bd command not found`

**Solution:** Ensure the Beads CLI is installed and in your PATH:
```bash
which bd
# If not found, install from https://github.com/steveyegge/beads
```

### Issues not loading

**Issue:** Frontend shows "Failed to load issues"

**Solutions:**
1. Check that backend is running: `curl http://localhost:3001/api/health`
2. Verify `.beads/issues.jsonl` exists: `ls -la .beads/`
3. Check server logs for errors

### WebSocket disconnected

**Issue:** "WebSocket disconnected" message in UI

**Solutions:**
1. Check that backend is running on port 3001
2. Check browser console for errors
3. UI auto-reconnects after 5 seconds - wait a moment

### Drag-and-drop not working

**Issue:** Can't drag cards on Kanban board

**Solution:** Minimum drag distance is 8px. Click and drag more decisively.

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `bun test:run`
5. Commit with conventional commits: `feat: add new feature`
6. Push and open a PR

## Roadmap

- [ ] Advanced filtering and search
- [ ] Bulk operations
- [ ] Time tracking
- [ ] Comments and activity history
- [ ] File attachments
- [ ] Custom fields
- [ ] Team collaboration features
- [ ] Mobile-responsive design improvements

## License

MIT

## Related Projects

- **[Beads](https://github.com/steveyegge/beads)** - The core issue tracker CLI
- **[Beads MCP](https://github.com/steveyegge/beads/tree/main/integrations/beads-mcp)** - MCP server for Claude Desktop

## Acknowledgments

Built with modern web technologies and designed to complement the excellent [Beads](https://github.com/steveyegge/beads) CLI by Steve Yegge.

## Support

- **Issues:** https://github.com/mgalpert/beads-viewer/issues
- **Discussions:** https://github.com/mgalpert/beads-viewer/discussions
- **Main Beads Project:** https://github.com/steveyegge/beads
