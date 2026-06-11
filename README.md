# Todo List UI

Frontend for Lotus List, a custom Daily Planner and Todo List application.

Built with Vue 3 (Composition API), TypeScript, Vite, Pinia, PrimeVue, and Tailwind CSS.

## Prerequisites

- Node.js (v18+ recommended)
- The [Todo List API](https://github.com/devkristin/todo-api) must be running locally

## Getting Started

1. Install Dependencies

   ```
   npm install
   ```

2. Create a Local Environment File (.env)

   Create a .env file in the root directory and point it to your local API server

   ```
   VITE_API_BASE_URL=http://localhost:3000
   ```

3. Run Local Development Server

   Compiles and hot-reloads the application in dev mode

   ```
   npm run dev
   ```

   - Access the application at: http://localhost:5173

## Production & Quality Tools

- Build: `npm run build` - Type-checks and creates a production-ready build in the /dist directory.

- Type-Check: `npm run type-check` - Runs vue-tsc to perform static type analysis on .vue and .ts files.

- Linting: `npm run lint` - Executes automated code linting via oxlint and eslint.

- Formatting: `npm run format` - Forces consistent code style using Prettier.
