# AI Agent Instructions for PC2 Laptimes

## Project Overview

**Project Cars 2 Lap Times Tracker** - A Vue 3 + TypeScript web application for tracking, browsing, and analyzing lap times from Project Cars 2 racing simulator. The app includes real-time data monitoring via UDP telemetry and WebSocket-based synchronization between clients.

**Status**: Work in Progress (Forever WiP)  
**Branch Context**: `feat/remove-firestore` - Migrating away from Firestore to a different data storage solution

## Tech Stack

### Frontend
- **Framework**: Vue 3 (Composition API and Options API hybrid)
- **Language**: TypeScript 4.5.5
- **Build Tool**: Vue CLI 5.0
- **State Management**: Custom reactive store (see `src/store/`)
- **Styling**: SCSS/SASS
- **UI Components**: 
  - Vue Select (dropdowns)
  - Vue3 Carousel
  - Chart.js + vue-chartjs (statistics visualization)
  - Vue Toaster (notifications)
  - FontAwesome & Material Icons

### Backend
- **Database**: PostgreSQL 17
- **API**: PostgREST (auto-generated REST API from PostgreSQL schema)
- **WebSocket Servers**: 
  - Node.js relay server for client-to-client notifications (`ws-server/`)
  - Python app WebSocket for game telemetry data
- **Deployment**: Podman containers + nginx
- **Container Platform**: Homelab Intel NUC with Podman pods

### Key Features
1. **Add Laptime**: Manual lap time entry with car, driver, track, and race settings
2. **Browse Times**: Filter and search lap times with detailed views
3. **Real-time Data**: Live telemetry monitoring from PC2 via UDP
4. **Statistics**: Leaderboards, medals, race day analytics
5. **Set Car Images**: Manage car imagery
6. **WebSocket Sync**: Real-time updates across multiple clients

## Project Structure

```
src/
├── assets/           # Static data (SQL, YAML configs, icons, images)
│   ├── db/          # Car, track, and image database TypeScript definitions
│   └── css/         # Component-specific CSS
├── builders/         # Data transformation classes (Builder pattern)
├── components/       # Vue components (organized by feature)
│   ├── ui/          # Reusable UI components (Button, Modal, RadioButtons)
│   └── [features]/  # Feature-specific components
├── constants/        # TypeScript enums and constants
├── pages/           # Top-level page components (routed views)
├── plugins/         # Vue plugins (store plugin)
├── store/           # Custom reactive state management
└── utils/           # Utility functions and helpers

ws-server/           # WebSocket notification relay server
deployment/          # Kubernetes/Podman deployment scripts
```

## Coding Conventions

### TypeScript
- **Strict typing**: Always use proper TypeScript types, avoid `any`
- **Interfaces over types**: Prefer interfaces for object shapes
- **Enums for constants**: Use const enums in `src/constants/` for related values
- **Shim files**: Type declarations for third-party libs without types are in `src/shims-*.d.ts`

### Vue Components
- **File naming**: PascalCase for components (e.g., `LaptimeTable.vue`, `NewCarModal.vue`)
- **Component structure**: 
  ```vue
  <template>
    <!-- Template content -->
  </template>

  <script lang="ts">
  // Script with TypeScript
  </script>

  <style scoped lang="scss">
  // Scoped styles with SCSS
  </style>
  ```
- **State management**: Use the custom store via `inject('store')` or props
- **Event bus**: Available at `src/eventBus.ts` for cross-component communication
- **Props typing**: Always type component props explicitly

### State Management
- **Store structure**: Modular stores in `src/store/`
  - `dataStore`: Laptimes, cars, tracks, drivers data
  - `realtimeDataStore`: Live telemetry data
  - `statisticsStore`: Aggregated statistics and leaderboards
  - `utilsStore`: UI state and utilities
- **Reactivity**: Uses Vue 3's `reactive()` - store is a reactive object
- **Store plugin**: Custom plugin in `src/plugins/store-plugin.ts` provides store to all components

### Builder Pattern
- **Purpose**: Transform raw data into domain models
- **Location**: `src/builders/`
- **Naming**: `*Builder.ts` (e.g., `LaptimeBuilder`, `StatisticsBuilder`)
- **Usage**: Centralized data transformation logic, keeps components clean

### Constants
- **Location**: `src/constants/*.ts`
- **Pattern**: Each file exports a const enum or const object
- **Examples**: `Game`, `WeatherType`, `TransmissionType`, `BrakingLine`
- **Import style**: Named imports (e.g., `import { Game } from '@/constants/Game'`)

## Database Schema

**Database**: PostgreSQL 17  
**API Access**: PostgREST (auto-generated REST API)  
**Naming Convention**: Database uses `snake_case` columns, application uses `camelCase` properties

The application tracks:
- **Laptimes**: Core entity with time, date, car, driver, track, race settings
- **Cars**: Vehicle definitions with make, model, class, year
- **Tracks**: Circuit definitions with variants (layouts) stored as JSONB
- **Drivers**: Player/driver profiles (2 drivers - one per racing PC setup)
- **Images**: Car imagery and associations

See `src/assets/` for SQL files:
- `create_tables.sql` - Complete schema with foreign keys and indexes
- `add_cars.sql`, `add_tracks.sql` - Initial data
- `grant_permissions.sql` - PostgREST permissions setup

### Database Access
- **REST API**: PostgREST provides full CRUD operations on database tables
- **API Endpoint**: `http://192.168.0.102:3000/` (homelab)
- **Schema**: `public`
- **Role**: `postgres` (no authentication required - home network only)

### Case Conversion
- **Package**: Uses `ts-case-convert` (v2.1.0) for automatic case conversion
- **Implementation**: Direct usage in store methods - `objectToSnake()` for outgoing data, `objectToCamel()` for incoming data
- **Location**: All fetch operations in `src/store/dataStore.ts` and `src/store/utilsStore.ts`
- **Special handling**: 
  - JSONB `variants` field is already parsed by PostgREST
  - `brakingLine` converts between boolean (DB) and 'on'/'off' string (app)
  - `dateString` calculated field added before database insert

## WebSocket Architecture

### Two WebSocket Connections

#### 1. Client-to-Client Notification WebSocket (Port 3002)
**Purpose**: Synchronize data changes between multiple browser instances

**Message Flow**:
1. Client performs database operation via PostgREST (add/update/delete)
2. Client broadcasts notification to WebSocket server
3. Server relays message to all connected clients
4. Other clients reload affected data from PostgreSQL

**Server Details**:
- **Location**: `ws-server/`
- **Type**: Simple relay server (no database connection)
- **Port**: 3002 (configurable via `WS_PORT` env var)
- **Deployment**: Runs in same container as nginx (managed by `docker-entrypoint.sh`)
- **Client state**: Tracked in `src/store/realtimeDataStore.ts` via `WebsocketState` enum

#### 2. Game Telemetry WebSocket
**Purpose**: Receive real-time data from Project Cars 2 via Python UDP relay app

**Data Flow**:
1. Project Cars 2 sends UDP telemetry packets
2. Python app (running on each racing PC) receives UDP data
3. Python app forwards data to browser via WebSocket
4. Browser displays live telemetry and enables "auto-submit" feature

**Auto-Submit Feature**: When a race finishes, the website automatically submits the lap time with correct driver, car, track, and race settings based on live telemetry data.

## Real-time Data (UDP Telemetry)

- **Source**: Project Cars 2 UDP telemetry packets
- **Implementation**: Parsed in `RealtimeDataBuilder`
- **Page**: `src/pages/RealtimeData.vue`
- **Store**: `realtimeDataStore`
- **Packet types**: Defined in `src/constants/PacketType.ts`

## Development Guidelines

### When Adding Features
1. **Check existing patterns**: Look at similar features first (e.g., other modals, other table components)
2. **Use TypeScript**: Create interfaces for new data structures
3. **Builder pattern**: For complex data transformations, create a builder
4. **Store updates**: Add state to appropriate store module (`dataStore`, `realtimeDataStore`, etc.)
5. **Constants**: Extract magic strings/numbers to constants files
6. **Reusable components**: Check `src/components/ui/` before creating new buttons, modals, etc.

### When Modifying Components
1. **Preserve reactivity**: Don't break reactive references when modifying store
2. **Type safety**: Update interfaces if changing data structures
3. **Child components**: Check for dependent child components before major changes
4. **Event bus**: Be cautious with eventBus changes - many components may listen

### Testing
- **Unit tests**: Jest + Vue Test Utils (see `tests/unit/`)
- **Run tests**: `npm run test:unit`
- **Config**: `jest.config.js`

## Deployment

### Local Development
```bash
npm install
npm run serve
```

### Development Environment Setup (Windows + WSL)

**Podman Setup**:
- Development happens in WSL (Debian-based)
- Podman runs in a separate `podman-machine-default` WSL distribution
- Both Windows and dev WSL connect to `podman-machine-default` via socket at `/mnt/wsl/podman-sockets/podman-machine-default/podman-user.sock`

**Common Issue: Podman Socket Not Found**
If `podman ps` fails with "unable to connect to Podman socket":

```powershell
# From Windows PowerShell:
# 1. Ensure systemd is enabled in podman-machine-default
wsl -d podman-machine-default -u root -e bash -c 'echo -e "[boot]\nsystemd=true" > /etc/wsl.conf'

# 2. Restart the podman machine
wsl --terminate podman-machine-default
wsl -d podman-machine-default

# 3. Verify it works
wsl -d podman-machine-default -e podman ps
```

From dev WSL, `podman ps` should now work.

### Production Build
```bash
npm run build
```

### Homelab Deployment (Intel NUC)

**Full Stack Deployment**:
```bash
./deploy.sh
# Or
npm run deploy:homelab
```

**What Gets Deployed** (Podman Pod with 5 containers):
1. **PostgreSQL 17** (port 5432) - Database with persistent volume (512MB RAM limit)
2. **PostgREST** (port 3000) - Auto-generated REST API from PostgreSQL schema (128MB RAM limit)
3. **Adminer** (port 8081) - Database admin UI (128MB RAM limit)
4. **Swagger UI** (port 8080) - PostgREST API documentation (128MB RAM limit)
5. **App + WebSocket** (ports 80, 3002) - Vue app (nginx) + WebSocket relay server (256MB RAM limit)

**Memory Management**:
- All containers have memory limits to prevent excessive filesystem cache growth
- Total container memory limit: ~1.14GB
- PostgreSQL cache settings tuned for homelab environment

**Deployment Process** (`deploy.sh`):
1. Check Podman availability and working status
2. Build Podman image locally
3. Save image to tar file
4. Copy to homelab server (Intel NUC) via SSH
5. Stop existing service if running
6. Load image on homelab
7. Run pod creation script
8. Cleanup old images and volumes

**Script features**:
- Validates Podman is working before starting (`podman ps` check)
- Exits on any error (`set -e`) - no continuing after failures
- Provides helpful troubleshooting messages for common issues

**Pod Creation** (`deployment/create-pod.sh`):
- Creates Podman pod named `pc2-laptimes`
- Sets up port mappings (8090:8080, 8080:80, 3000:3000, 3001:8081, 3002:3002)
- Configures PostgreSQL with secrets for password management
- Generates systemd service for auto-start on boot
- Enables and starts the pod

### Container Architecture
- **Image Build**: Multi-stage build (Vue build → nginx:alpine + WebSocket server)
- **Base Image**: `nginx:alpine` for minimal size (~150-200MB total vs 1GB with Debian-based nginx)
- **Entry point**: `docker-entrypoint.sh` starts nginx and WebSocket server
- **Volume**: `pc2-laptimes-pgdata` for PostgreSQL persistence
- **Secrets**: Podman secrets for database passwords

## Important Notes for AI Agents

### Active Development Context
- **Current branch**: `feat/remove-firestore` - Migration from Firestore to PostgreSQL + PostgREST
- **Migration complete**: Data layer now uses PostgreSQL with PostgREST API
- **No authentication**: Home network only, no user accounts needed
- **Two racing PCs**: App designed for simultaneous use on 2 computers with auto-submit feature

### Common Patterns to Follow
1. **Data loading**: Use store methods, show loading spinner (`PulseLoader`)
2. **Notifications**: Use `vue-toaster` for user feedback (success, error, info)
3. **Modals**: Reuse `Modal.vue` component from `ui/` folder
4. **Buttons**: Use `Button.vue` component with `ButtonType` enum
5. **Dropdowns**: Use `vue-select` (registered globally as `v-select`) - `SelectInput.vue` component automatically sorts options alphabetically
6. **Date pickers**: Use `vue3-datepicker` component
7. **Scrollbars**: Use `vue3-perfect-scrollbar` for custom scrollable areas

### File Modifications
- **Don't modify shim files** unless adding new third-party library types
- **SQL files in assets**: Reference only, not executed by app directly
- **YAML configs**: Track data files (e.g., `all-track-names.yml`)
- **Deployment scripts**: Be cautious, these are environment-specific

### Anti-patterns to Avoid
- ❌ Using `any` type in TypeScript
- ❌ Adding Firestore code (migration to PostgreSQL is complete)
- ❌ Implementing authentication/user accounts (not needed for home use)
- ❌ Creating inline styles instead of SCSS modules
- ❌ Direct DOM manipulation (use Vue refs and reactive data)
- ❌ Bypassing the store for shared state
- ❌ Hardcoding values that should be constants
- ❌ Follow `DRY` principle - avoid code duplication
- ❌ Follow `SOLID` principles where applicable
- ❌ Do not create random readme files without purpose, rather explain simply in chat
- ❌ Do not use extensive comments in code; keep code self-explanatory

### When Unsure
1. **Search the codebase**: Use similar feature implementations as reference
2. **Check constants**: Look in `src/constants/` for existing enums/values
3. **Review store**: Check store structure for existing state management patterns
4. **Ask the user**: If modifying critical deployment or database logic

## Useful Commands

```bash
# Development
npm run serve              # Start dev server
npm run build              # Production build
npm run lint               # Lint code
npm run test:unit          # Run unit tests

# Deployment
npm run deploy:homelab     # Deploy to homelab
./deploy.sh                # Alternative deployment script

# WebSocket Server (Development)
cd ws-server
npm install
npm run dev                # Start WebSocket server locally
```

## External Dependencies to Be Aware Of

- **Project Cars 2**: The racing simulator that provides UDP telemetry
- **Python UDP Relay App**: External app (not in this repo) that receives PC2 UDP data and forwards to browser via WebSocket
- **PostgreSQL 17**: Database server running in separate container
- **PostgREST**: Auto-generates REST API from PostgreSQL schema
- **Homelab Intel NUC**: Physical server running Podman pods
- **nginx**: Web server in production container
- **Node.js**: Required in production for WebSocket relay server
- **Adminer**: Database administration UI (port 8081)
- **Swagger UI**: API documentation UI (port 8080)

## Architecture Summary (Quick Reference)

### Data Flow
1. **Game → Python App → Browser**: UDP telemetry → WebSocket → Real-time display
2. **Browser → Database**: PostgREST API → PostgreSQL
3. **Browser ↔ Browser**: WebSocket relay (port 3002) for change notifications

### Multi-PC Setup
- **2 Racing PCs**: Each runs Project Cars 2 + Python UDP relay app
- **2 Browser Instances**: One per PC, both connect to same homelab server
- **Auto-Submit**: After race, telemetry data auto-fills laptime form (Driver has to be selected manually beforehand)
- **Real-Time Sync**: When PC1 adds laptime, PC2's browser auto-refreshes because of notification from PC1 via WebSocket

### No Authentication
- **Home network only**: No login, no user accounts
- **Security**: Assumes trusted home network environment

### Ports Overview
- **80**: Vue app (nginx)
- **3000**: PostgREST API
- **3002**: WebSocket relay (client-to-client notifications)
- **5432**: PostgreSQL (internal to pod)
- **8080**: Swagger UI (API docs)
- **8081**: Adminer (database UI)
- **8090**: Alternative app access

---

**Last Updated**: November 15, 2025  
**Maintainer**: Feel free to update this file as the project evolves!
