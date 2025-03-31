# SpacetimeDB Starter Application

A minimal chat application built with SpacetimeDB, TypeScript, and Vite. This project serves as a starting point for SpacetimeDB applications.

## Features

- Real-time chat with SpacetimeDB
- User presence (online/offline status)
- Custom user names
- Clean, responsive UI

## Tech Stack

- **Frontend**: TypeScript, Vite
- **Backend**: SpacetimeDB (Rust)
- **Communication**: SpacetimeDB SDK

## Project Structure

- `client/` - Frontend code
  - `src/` - Source files
    - `main.ts` - Main application entry point
    - `module_bindings.ts` - Auto-generated SpacetimeDB bindings
    - `style.css` - Application styles
- `server/` - SpacetimeDB Rust code
  - `src/lib.rs` - Database schema and reducers

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or newer)
- [Rust](https://www.rust-lang.org/tools/install)
- [SpacetimeDB CLI](https://spacetimedb.com/docs/getting-started)

### Setup for Local Development

1. Clone the repository

   ```bash
   git clone <repository-url>
   cd spacetimedb-chat
   ```

2. Install client dependencies

   ```bash
   cd client
   npm install
   ```

3. Make sure SpacetimeDB is running locally

   ```bash
   spacetime start
   ```

4. Publish the module

   ```bash
   spacetime publish --project-path server {MODULE_NAME}
   ```

   Include `-c` at the end if you need to wipe existing data.

5. Generate the TypeScript code

   ```bash
   spacetime generate --lang typescript --out-dir client/src/module_bindings --project-path server
   ```

6. Start the web app
   ```bash
   cd client && npm run dev
   ```

### Logging

You can view logs by using `spacetime logs {module_name}` with the `-f` flag for attaching and following new log lines as they come in.

## Deployment to Remote

1. Publish the module to maincloud

   ```bash
   spacetime publish -s maincloud --project-path server {MODULE_NAME}
   ```

   Include `-c` at the end if you need to wipe existing data.

2. Generate the TypeScript code

   ```bash
   spacetime generate --lang typescript --out-dir client/src/module_bindings --project-path server
   ```

3. Start the web app

   ```bash
   cd client && npm run dev
   ```

4. Build for production (when ready to deploy)

   ```bash
   cd client
   npm run build
   ```

5. Deploy the client to your preferred hosting service (Vercel, Netlify, etc.)

## Extending the Project

### Adding New Database Tables

1. Define new tables in `server/src/lib.rs`

   ```rust
   #[spacetimedb::table(name = your_table_name, public)]
   pub struct YourTable {
       #[primary_key]
       id: u64,
       // Add your fields here
   }
   ```

2. Create reducers for your new table

   ```rust
   #[spacetimedb::reducer]
   pub fn your_reducer(ctx: &ReducerContext, /* params */) -> Result<(), String> {
       // Implementation
   }
   ```

3. Rebuild the module and regenerate bindings
   ```bash
   spacetime publish --project-path server {MODULE_NAME}
   spacetime generate --lang typescript --out-dir client/src/module_bindings --project-path server
   ```

### Adding UI Components

1. Modify the HTML structure in `client/src/main.ts`
2. Add corresponding styles in `client/src/style.css`
3. Implement any required JavaScript/TypeScript logic

### Handling SpacetimeDB Events

To handle events for your new tables, add event handlers in `client/src/main.ts`:

```typescript
// Example for a custom table
const handleCustomInsert = (_ctx: any, item: CustomType) => {
  console.log(`Item Inserted: ${item.id}`);
  // Update your UI or state accordingly
};

// In your connection setup:
if (conn.db?.custom_table) {
  conn.db.custom_table.onInsert(handleCustomInsert);
}
```

## License

MIT

## Resources

- [SpacetimeDB Documentation](https://spacetimedb.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/guide/)
