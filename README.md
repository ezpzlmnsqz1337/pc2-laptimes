# project-cars2-times

Simple app to track lap times in Project Cars 2.

Forever WiP obviously.

## Node.js version

This repository uses Node.js 22 LTS. The version is pinned in `.nvmrc`.

## Using nvm

If you have `nvm` installed, run these commands from the project root:

```bash
nvm install
nvm use
node -v
```

Then install dependencies and start development:

```bash
npm install
cp .env.example .env.local   # paste VUE_APP_PGRST_JWT; needed for writes only
npm run serve
```

Database reads are anonymous; writes need the shared PostgREST JWT. See
`.env.example` and the "PostgREST Auth Setup" section in [AGENTS.md](AGENTS.md).

## Documentation

Architecture, coding conventions, deployment, and project context are documented in [AGENTS.md](AGENTS.md).
