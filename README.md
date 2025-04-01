# SpacetimeDB Chat Starter

A minimal real-time chat application built with SpacetimeDB, TypeScript (Vite), and Rust.
This project serves as a well-structured starting point for building your own SpacetimeDB applications.

## Features

- Real-time chat messages via SpacetimeDB
- User presence (online/offline status)
- Setting and displaying custom user names
- Timestamps for messages
- Clean, responsive UI built with vanilla TypeScript and CSS
- Modular frontend and backend code structure

## Tech Stack

- **Backend**: SpacetimeDB (Rust Module)
- **Frontend**: TypeScript, Vite, Vanilla CSS
- **Communication**: SpacetimeDB TypeScript SDK

## Project Structure

```
.
├── client/           # Frontend Vite application
│   ├── public/         # Static assets
│   │   ├── assets/     # Frontend assets (e.g., images, icons)
│   │   │   ├── assets/     # Frontend assets (e.g., images, icons)
│   │   │   ├── components/ # Reusable UI components (TypeScript classes)
│   │   │   ├── config/     # Application configuration (app-config.ts, constants.ts)
│   │   │   ├── module_bindings/ # Auto-generated SpacetimeDB TypeScript bindings
│   │   │   ├── services/   # Services (e.g., SpacetimeDB connection)
│   │   │   ├── styles/     # CSS styles (main.css)
│   │   │   ├── utils/      # Utility functions (currently empty)
│   │   │   └── main.ts     # Application entry point
│   │   ├── index.html      # Main HTML file
│   │   ├── package.json    # Frontend dependencies and scripts
│   │   ├── tsconfig.json   # TypeScript configuration
│   │   └── vite.config.js  # Vite configuration (if customized, currently default)
│   ├── index.html      # Main HTML file
│   ├── package.json    # Frontend dependencies and scripts
│   ├── tsconfig.json   # TypeScript configuration
│   └── vite.config.js  # Vite configuration (if customized, currently default)
│
├── server/           # SpacetimeDB Rust module
│   ├── src/
│   │   ├── modules/    # Core application logic modules
│   │   │   ├── message/  # Message-related logic (models, reducers)
│   │   │   ├── scheduler/# Example scheduler logic (models, reducers)
│   │   │   └── user/     # User-related logic (models, reducers)
│   │   └── lib.rs      # Module entry point, lifecycle hooks
│   └── Cargo.toml    # Rust dependencies
│
├── .gitignore        # Git ignore rules for root
└── README.md         # This file
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended, e.g., v22+)
- [Rust](https://www.rust-lang.org/tools/install) (Stable toolchain)
- [SpacetimeDB CLI](https://spacetimedb.com/docs/getting-started) (Follow installation guide)

### Setup for Local Development

1.  **Clone the Repository**: `git clone <repository-url> <your-project-name>`
2.  **Navigate to Project**: `cd <your-project-name>`
3.  **Install Client Dependencies**: `cd client && npm install`
4.  **Start SpacetimeDB Locally**: `cd .. && spacetime start` (Run from the project root)
5.  **Publish the Module**: (From project root)
    ```bash
    # Replace YOUR_MODULE_NAME with a unique name (e.g., my-chat-app)
    # You only need to name it on the first publish.
    spacetime publish --project-path server YOUR_MODULE_NAME
    ```
    - Use `spacetime publish --project-path server YOUR_MODULE_NAME -c` to wipe existing data on subsequent publishes if needed.
6.  **Generate TypeScript Bindings**: (From project root)
    ```bash
    spacetime generate --lang typescript --out-dir client/src/module_bindings --project-path server
    ```
7.  **Run the Client Dev Server**: `cd client && npm run dev`
8.  **Access the App**: Open your browser to the local URL provided by Vite (usually `http://localhost:5173`).

### Local Development Workflow

- **Backend Changes (Rust)**:
  1.  Modify files in `server/src/`.
  2.  Republish the module: `spacetime publish --project-path server YOUR_MODULE_NAME [-c]` (from root).
  3.  Regenerate bindings: `spacetime generate --lang typescript --out-dir client/src/module_bindings --project-path server` (from root).
  4.  (Client might hot-reload, or you may need to restart `npm run dev`).
- **Frontend Changes (TypeScript/CSS)**:
  1.  Modify files in `client/src/`.
  2.  Vite's dev server (`npm run dev`) should automatically hot-reload the changes in your browser.

### Viewing Logs

You can view real-time logs from your locally running module using:

```bash
spacetime logs YOUR_MODULE_NAME -f
```

## Deployment to SpacetimeDB Cloud

1.  **Publish Module to Cloud**: (From project root)
    ```bash
    # Make sure you are logged in: spacetime login
    spacetime publish -s maincloud --project-path server YOUR_MODULE_NAME
    ```
    - Use `-c` to wipe existing cloud data if needed.
2.  **Generate Bindings (Optional but Recommended)**: Regenerate bindings after publishing to ensure they match the deployed module.
    ```bash
    spacetime generate --lang typescript --out-dir client/src/module_bindings --project-path server
    ```
3.  **Update Client Configuration**: In `client/src/config/app-config.ts`, ensure the `host` points to the maincloud (`wss://maincloud.spacetimedb.com`).
4.  **Build the Client for Production**:
    ```bash
    cd client
    npm run build
    ```
5.  **Deploy the Client**: Deploy the contents of the `client/dist` directory to your preferred static hosting provider (e.g., Vercel, Netlify, Cloudflare Pages, AWS S3/CloudFront).

## Extending the Project

This template provides a solid foundation. Here's how to add features:

### Adding New Database Tables/Data

1.  **Define Struct**: Create a new struct in a relevant module under `server/src/modules/`, for example, `server/src/modules/entity/models.rs`:

    ```rust
    // server/src/modules/entity/models.rs
    use spacetimedb::{spacetimedb, Identity, Timestamp, SpacetimeType };

    // Structs stored within table fields need SpacetimeType
    #[derive(SpacetimeType, Clone)]
    pub struct Position {
        pub x: f32,
        pub y: f32,
    }

    // Use the syntax observed in user/models.rs
    #[spacetimedb::table(name = entity, public)]
    pub struct Entity {
        // Use the syntax observed in user/models.rs
        #[primary_key]
        // Add auto_inc for SpacetimeDB to generate sequential IDs
        #[auto_inc]
        pub entity_id: u64,
        pub owner: Identity,
        pub pos: Position,
        pub created_at: Timestamp,
    }
    ```

    - **Note:** Nested structs like `Position` must derive `SpacetimeType` and `Clone`.

2.  **Declare in Module**: Make sure the new module (`entity`) and its `models.rs` file are declared in their respective parent `mod.rs` files.

    ```rust
    // server/src/modules/entity/mod.rs
    pub mod models;
    // pub mod reducers; // Add if you create reducers

    pub use models::Entity;
    // pub use models::Position; // Only if needed elsewhere
    ```

    ```rust
    // server/src/modules/mod.rs
    pub mod message;
    pub mod scheduler;
    pub mod user;
    pub mod entity; // Add the new module
    ```

3.  **Republish & Regenerate**: Follow the steps in the _Local Development Workflow_ to republish the module and regenerate the TypeScript bindings. You should now see `Entity` and `Position` types in `client/src/module_bindings/`.

### Adding New Reducers (Server Logic)

1.  **Create Reducer Function**: Add a function in the appropriate `reducers.rs` file (e.g., `server/src/modules/entity/reducers.rs`). Make sure to create this file and declare `pub mod reducers;` in `server/src/modules/entity/mod.rs`.

    ```rust
    // server/src/modules/entity/reducers.rs
    use spacetimedb::{ReducerContext, Identity, Table, Timestamp};
    use crate::modules::entity::models::{Entity, Position};

    #[spacetimedb::reducer]
    pub fn spawn_entity(ctx: &ReducerContext, initial_x: f32, initial_y: f32) -> Result<(), String> {
        let owner_identity = ctx.sender;
        let current_time = ctx.timestamp;

        // entity_id is set automatically due to #[auto_inc]
        ctx.db.entity().insert(Entity {
             entity_id: 0, // This value is ignored by insert when #[auto_inc] is used
             owner: owner_identity,
             pos: Position { x: initial_x, y: initial_y },
             created_at: current_time,
        })?;

        Ok(())
    }

    #[spacetimedb::reducer]
    pub fn move_entity(ctx: &ReducerContext, entity_id: u64, new_x: f32, new_y: f32) -> Result<(), String> {
        let sender_identity = ctx.sender;

        // Use the find/update pattern observed in user/reducers.rs
        // Note: The method to find/update by primary key is named after the field (e.g., .entity_id())
        if let Some(mut entity) = ctx.db.entity().entity_id().find(&entity_id) {
            // Optional: Check ownership
            if entity.owner != sender_identity {
                return Err("Cannot move entity owned by another user".to_string());
            }

            // Update position
            entity.pos.x = new_x;
            entity.pos.y = new_y;

            ctx.db.entity().entity_id().update(&entity_id, entity)?;
            Ok(())
        } else {
            Err(format!("Entity with ID {} not found", entity_id))
        }
    }
    ```

    - **Note:** The method used to access rows by primary key is named after the field marked with `#[primary_key]`. For `identity: Identity`, it's `.identity()`. For `entity_id: u64`, it's `.entity_id()`.

2.  **Re-export (Optional)**: If you want to call these reducers easily from `lib.rs` or other modules, re-export them from `server/src/modules/entity/mod.rs`.
3.  **Republish & Regenerate**: Publish the module and regenerate bindings.

### Adding UI Components (Client)

1.  **Create Component File**: Add a new TypeScript class file in `client/src/components/`, mirroring the structure of existing components (e.g., `EntityDisplay.ts`).
    - It should typically accept a container element ID or element reference in its constructor.
    - Implement methods to update its internal state and render the UI (e.g., `updateEntities(entitiesMap)`).
    - Manage its own DOM elements within the provided container.
2.  **Add HTML Container**: Add a corresponding `<div>` or other container element in `client/index.html`.
3.  **Instantiate in `main.ts`**: Create an instance of your new component in the `initializeApp` function in `client/src/main.ts`.
4.  **Add Styles**: Add necessary CSS rules to `client/src/styles/main.css` targeting the classes used by your new component.

### Handling SpacetimeDB Events (Client)

1.  **Import Type**: Import the generated `Entity` type from `client/src/module_bindings/` into `client/src/services/spacetimedb-service.ts`.
2.  **Add Callback Type**: Define a new callback type (e.g., `type EntityUpdateCallback = (oldEntity: Entity, newEntity: Entity, eventType: "insert" | "update" | "delete") => void;`).
3.  **Add Event Handler Array**: Add an array to store callbacks (e.g., `private onEntityUpdateCallbacks: EntityUpdateCallback[] = [];`).
4.  **Add Registration Method**: Create a public method to register callbacks (e.g., `public onEntityUpdate(...)`).
5.  **Register Listener**: In the `registerEventListeners` method, add logic to attach listeners to your new table (e.g., `conn.db?.entity?.onInsert(this.handleEntityInsert.bind(this));`, `conn.db?.entity?.onUpdate(this.handleEntityUpdate.bind(this));`, etc.). Remember to handle potential `undefined` tables.
6.  **Implement Internal Handler(s)**: Create private handler methods (e.g., `handleEntityInsert`, `handleEntityUpdate`) that iterate over and call the registered callbacks, passing the relevant data and event type.
7.  **Subscribe to Table**: Add the table to the `subscribe` call in `handleConnect` (e.g., `"SELECT * FROM entity"`).
8.  **Use in `main.ts`**: In `client/src/main.ts`, within `setupDatabaseEventHandlers`, use the new registration method (`dbService.onEntityUpdate(...)`) to listen for changes and update your new UI component instance or relevant application state.

## License

MIT

## Resources

- [SpacetimeDB Documentation](https://spacetimedb.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/guide/)
