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
- Instructions for extending to add Emoji reactions to messages (👍, ❤️, 😂, 🎉, 😮, 🚀)

## Tech Stack

- **Backend**: SpacetimeDB (Rust Module)
- **Frontend**: TypeScript, Vite, Vanilla CSS
- **Communication**: SpacetimeDB TypeScript SDK

## Project Structure

```
.
├── client/                 # Frontend Vite application
│   ├── src/
│   │   ├── components/    # Reusable UI components (TypeScript classes)
│   │   ├── config/        # Application configuration (app-config.ts, constants.ts)
│   │   ├── module_bindings/# Auto-generated SpacetimeDB TypeScript bindings
│   │   ├── services/      # Services (e.g., SpacetimeDB connection)
│   │   ├── styles/        # CSS styles (main.css)
│   │   ├── utils/         # Utility functions
│   │   └── main.ts        # Application entry point
│   ├── public/            # Static assets
│   ├── index.html         # Main HTML file
│   ├── package.json       # Frontend dependencies and scripts
│   ├── tsconfig.json      # TypeScript configuration
│   └── vite.config.ts     # Vite configuration
│
├── server/                 # SpacetimeDB Rust module
│   ├── src/
│   │   ├── modules/       # Core application logic modules
│   │   │   ├── message/   # Message-related logic (models, reducers)
│   │   │   ├── scheduler/ # Example scheduler logic (models, reducers)
│   │   │   └── user/      # User-related logic (models, reducers)
│   │   └── lib.rs         # Module entry point, lifecycle hooks
│   └── Cargo.toml         # Rust dependencies
│
├── .gitignore             # Git ignore rules
└── README.md              # Project documentation
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

### Example Feature: Emoji Message Reactions

This guide will walk you through adding emoji reactions to chat messages, a common feature in real-world chat applications. We'll cover types, database modeling, server logic with a toggle reducer, frontend component creation, and event handling with SpacetimeDB.

---

### Step-by-Step Guide:

#### 1. Create Types Module (Rust)

First, create a new file `server/src/modules/message/types.rs` to define our shared types:

```rust
use spacetimedb::SpacetimeType;

/// Represents an emoji reaction to a chat message.
#[derive(SpacetimeType)]
pub enum ReactionEmoji {
    ThumbsUp,   // 👍
    Heart,      // ❤️
    Laugh,      // 😂
    Party,      // 🎉
    Wow,        // 😮
    Rocket,     // 🚀
}

/// Extension trait for ReactionEmoji to provide a method to convert to an emoji string.
impl ReactionEmoji {
    /// Converts the ReactionEmoji enum variant to its corresponding emoji string.
    ///
    /// # Returns
    /// A string slice representing the emoji.
    pub fn to_emoji(&self) -> &'static str {
        match self {
            ReactionEmoji::ThumbsUp => "👍",
            ReactionEmoji::Heart => "❤️",
            ReactionEmoji::Laugh => "😂",
            ReactionEmoji::Party => "🎉",
            ReactionEmoji::Wow => "😮",
            ReactionEmoji::Rocket => "🚀",
        }
    }
}
```

#### 2. Update Message Module Declaration (Rust)

Update the `server/src/modules/message/mod.rs` file to declare and export our types:

```rust
//! Module containing logic related to chat messages.

// Module declarations
pub mod models;
pub mod reducers;
pub mod types;

// Selective re-exports from this module
pub use models::Message;
pub use reducers::send_message;
pub use types::ReactionEmoji;

```

#### 3. Update and Define the Database Model (Rust)

Update the `Message` table (adding the `message_id` column) and add a `Reaction` table in `server/src/modules/message/models.rs`:

```rust
// server/src/modules/message/models.rs
/// ... existing use declaration(s) ...
use crate::modules::message::types::ReactionEmoji;

// Extend the Message table to add an ID
pub struct Message {
    #[primary_key]
    #[auto_inc] // Auto-incremented message ID
    pub message_id: u64,
    /// The identity of the user who sent the message.
    pub sender: Identity,
    /// The server timestamp when the message was received.
    pub sent: Timestamp,
    /// The text content of the message.
    pub text: String,
}

// Add the Reaction table

/// Represents an emoji reaction to a chat message.
#[spacetimedb::table(name = reaction, public)]
pub struct Reaction {
    #[primary_key]
    #[auto_inc] // Auto-incremented reaction ID
    pub reaction_id: u64,
    // The ID of the message that was reacted to
    pub message_id: u64,
    // The emoji that was reacted to the message
    pub emoji: ReactionEmoji,
    // The identity of the user who reacted to the message
    pub reactor: Identity,
    // The server timestamp when the reaction was received
    pub reacted_at: Timestamp,
}
```

#### 4. Implement Server Reducers (Rust)

Update the `send_message` reducer and add new reducers for toggling reactions in `server/src/modules/message/reducers.rs`:

```rust
// server/src/modules/message/reducers.rs
// add to the use declarations
use crate::modules::message::models::{message, Message, reaction, Reaction};
use crate::modules::message::types::ReactionEmoji;

// ... existing code ...
#[spacetimedb::reducer]
pub fn send_message(ctx: &ReducerContext, text: String) -> Result<(), String> {
// ... existing code ...
    ctx.db.message().insert(Message {
        message_id: 0, // <-- Add this
        sender: ctx.sender,
        text,
        sent: ctx.timestamp, // Use the server timestamp when the reducer is called
    });
    Ok(())
}

/// Reducer to toggle an emoji reaction on a message.
///
/// # Arguments
/// * `ctx` - The reducer context, providing sender identity and timestamp.
/// * `message_id` - The ID of the message to react to.
/// * `emoji` - The emoji to react with.
///
/// # Returns
/// * `Ok(())` on successful reaction insertion.
#[spacetimedb::reducer]
pub fn toggle_reaction(
    ctx: &ReducerContext,
    message_id: u64,
    emoji: ReactionEmoji
) -> Result<(), String> {
    let reactor = ctx.sender;

    if let Some(existing_reaction) = ctx.db.reaction().iter().find(|r| {
        r.message_id == message_id && r.reactor == reactor && r.emoji.to_emoji() == emoji.to_emoji()
    }) {
        ctx.db.reaction().reaction_id().delete(&existing_reaction.reaction_id);
    } else {
        ctx.db.reaction().insert(Reaction {
            reaction_id: 0,
            message_id,
            emoji,
            reactor,
            reacted_at: ctx.timestamp,
        });
    }

    Ok(())
}

```

After updating, republish and regenerate bindings:

```bash
spacetime publish --project-path server YOUR_MODULE_NAME -c
spacetime generate --lang typescript --out-dir client/src/module_bindings --project-path server
```

#### 5. Update SpacetimeDBService (TypeScript)

Now that we have the server-side implementation and generated TypeScript bindings, let's update our `SpacetimeDBService` class to handle reactions. This involves updating imports, adding reaction event handlers, and implementing a method to toggle and get reactions.

```typescript
// client/src/services/spacetimedb-service.ts

// Update imports to include Reaction and ReactionEmoji types
import {
  DbConnection,
  ErrorContext,
  EventContext,
  Message,
  User,
  Reaction,
  ReactionEmoji,
} from "../module_bindings";

// ... existing code ...

// Add callback types for reaction events
/** Callback function type for new reaction insertion. */
type ReactionInsertCallback = (reaction: Reaction) => void;
/** Callback function type for reaction updates. */
type ReactionUpdateCallback = (
  oldReaction: Reaction,
  newReaction: Reaction
) => void;
/** Callback function type for reaction deletion. */
type ReactionDeleteCallback = (reaction: Reaction) => void;

class SpacetimeDBService {
  // ... existing code ...

  // Add event handler arrays and map of message IDs
  private onReactionInsertCallbacks: ReactionInsertCallback[] = [];
  private onReactionUpdateCallbacks: ReactionUpdateCallback[] = [];
  private onReactionDeleteCallbacks: ReactionDeleteCallback[] = [];

  private messageReactions: Map<bigint, Reaction[]> = new Map();

  // existing  code, add this somewhere between functions

  /**
   * Calls the `toggleReaction` reducer on the SpacetimeDB module.
   * Toggles an emoji reaction on a message (adds or removes it).
   * Requires an active connection.
   * @param {bigint} messageId - The ID of the message to react to.
   * @param {ReactionEmoji} emoji - The emoji reaction to toggle.
   */
  public toggleReaction(messageId: bigint, emoji: ReactionEmoji): void {
    if (!this.isConnected || !this.connection) {
      console.warn("Cannot toggle reaction: Not connected");
      return;
    }

    try {
      this.connection.reducers.toggleReaction(messageId, emoji);
    } catch (e) {
      console.error("Error calling toggleReaction reducer:", e);
    }
  }

    /**
   * Retrieves all reactions for a given message ID.
   * @param {bigint} messageId - The ID of the message to retrieve reactions for.
   * @returns {Reaction[]} An array of Reaction objects.
   */
  public getReactions(messageId: bigint): Reaction[] {
    if (!this.isConnected || !this.connection) {
      console.warn("Cannot get reactions: Not connected");
      return [];
    }
    return Array.from(this.connection.db.reaction.iter()).filter(
      (reaction) => reaction.messageId === messageId
    );
  }

  /**
   * Retrieves all reactions for a given message ID.
   * @param {bigint} messageId - The ID of the message to retrieve reactions for.
   * @returns {Reaction[]} An array of Reaction objects.
   */
  public getMessageReactions(messageId: bigint): Reaction[] {
    return this.messageReactions.get(messageId) || [];
  }

  /**
   * Subscribe to reaction updates for a message
   */
  public subscribeToMessageReactions(
    messageId: bigint,
    callback: (reactions: Reaction[]) => void
  ): () => void {
    // Initial update
    const reactions = this.getMessageReactions(messageId);
    callback(reactions);

    // Set up event handlers
    const insertHandler = (reaction: Reaction) => {
      if (reaction.messageId === messageId) {
        const reactions = this.getMessageReactions(messageId);
        reactions.push(reaction);
        this.messageReactions.set(messageId, reactions);
        callback(reactions);
      }
    };

    const updateHandler = (_old: Reaction, newReaction: Reaction) => {
      if (newReaction.messageId === messageId) {
        const reactions = this.getMessageReactions(messageId);
        const index = reactions.findIndex(
          (r) => r.reactionId === newReaction.reactionId
        );
        if (index !== -1) {
          reactions[index] = newReaction;
          this.messageReactions.set(messageId, reactions);
          callback(reactions);
        }
      }
    };

    const deleteHandler = (reaction: Reaction) => {
      if (reaction.messageId === messageId) {
        const reactions = this.getMessageReactions(messageId);
        const filtered = reactions.filter(
          (r) => r.reactionId !== reaction.reactionId
        );
        this.messageReactions.set(messageId, filtered);
        callback(filtered);
      }
    };

    // Register handlers
    this.onReactionInsert(insertHandler);
    this.onReactionUpdate(updateHandler);
    this.onReactionDelete(deleteHandler);

    // Return unsubscribe function
    return () => {
      this.onReactionInsertCallbacks = this.onReactionInsertCallbacks.filter(
        (h) => h !== insertHandler
      );
      this.onReactionUpdateCallbacks = this.onReactionUpdateCallbacks.filter(
        (h) => h !== updateHandler
      );
      this.onReactionDeleteCallbacks = this.onReactionDeleteCallbacks.filter(
        (h) => h !== deleteHandler
      );
    };
  }

  // Add event registration methods
  /** Registers a callback for Reaction table insertions. */
  public onReactionInsert(callback: ReactionInsertCallback): void {
    this.onReactionInsertCallbacks.push(callback);
  }

  /** Registers a callback for Reaction table updates. */
  public onReactionUpdate(callback: ReactionUpdateCallback): void {
    this.onReactionUpdateCallbacks.push(callback);
  }

  /** Registers a callback for Reaction table deletions. */
  public onReactionDelete(callback: ReactionDeleteCallback): void {
    this.onReactionDeleteCallbacks.push(callback);
  }

  // ... existing methods ...

  private handleConnect(
    conn: DbConnection,
    identity: Identity,
    token: string
  ): void {
    // ... existing code ...

    // update subscription to include reaction table
    conn
      .subscriptionBuilder()
      .subscribe([
        "SELECT * FROM user",
        "SELECT * FROM message",
        "SELECT * FROM reaction",
      ]);

    // ... existing code ...
  }

  private registerEventListeners(conn: DbConnection): void {
    try {
      // ... existing code for other tables ...

      // Add listeners for the Reaction table
      if (conn.db?.reaction) {
        conn.db.reaction.onInsert(this.handleReactionInsert.bind(this));
        conn.db.reaction.onUpdate(this.handleReactionUpdate.bind(this));
        conn.db.reaction.onDelete(this.handleReactionDelete.bind(this));
        console.log("Attached listeners for Reaction table.");
      } else {
        console.warn(
          "Reaction table not available on connection, cannot attach listeners."
        );
      }
    } catch (e) {
      console.error("Error registering database event listeners:", e);
    }
  }

  // Add handlers for reaction events
  private handleReactionInsert(_ctx: EventContext, reaction: Reaction): void {
    this.onReactionInsertCallbacks.forEach((callback) => callback(reaction));
  }

  private handleReactionUpdate(
    _ctx: EventContext,
    oldReaction: Reaction,
    newReaction: Reaction
  ): void {
    this.onReactionUpdateCallbacks.forEach((callback) =>
      callback(oldReaction, newReaction)
    );
  }

  private handleReactionDelete(_ctx: EventContext, reaction: Reaction): void {
    this.onReactionDeleteCallbacks.forEach((callback) => callback(reaction));
  }



// ... existing code ...
```

This update to the `SpacetimeDBService` allows our client application to:

1. Subscribe to reaction data from the server
2. Toggle reactions on messages by calling the server reducer
3. Get reactions on messages by iterating over the client cache
4. Listen for reaction changes (insertions, updates, deletions)

We still need to actually add the Components and UI to do perform these calls.

#### 6. Add Emoji Picker UI (TypeScript/CSS)

Create a new `ReactionPicker` component in `client/src/components/ReactionPicker.ts`:

```typescript
import { ReactionEmoji } from "../module_bindings";

export class ReactionPicker {
  private element: HTMLElement;
  private onClose: () => void;
  private onReactionSelect: (emoji: ReactionEmoji) => void;

  constructor(
    onClose: () => void,
    onReactionSelect: (emoji: ReactionEmoji) => void
  ) {
    this.onClose = onClose;
    this.onReactionSelect = onReactionSelect;
    this.element = this.createPicker();
  }

  private createPicker(): HTMLElement {
    const pickerEl = document.createElement("div");
    pickerEl.className = "reaction-picker";

    const reactions: { emoji: string; type: ReactionEmoji }[] = [
      { emoji: "👍", type: { tag: "ThumbsUp" } },
      { emoji: "❤️", type: { tag: "Heart" } },
      { emoji: "😂", type: { tag: "Laugh" } },
      { emoji: "🎉", type: { tag: "Party" } },
      { emoji: "😮", type: { tag: "Wow" } },
      { emoji: "🚀", type: { tag: "Rocket" } },
    ];

    reactions.forEach(({ emoji, type }) => {
      const button = document.createElement("button");
      button.className = "reaction-option";
      button.textContent = emoji;
      button.addEventListener("click", () => {
        this.onReactionSelect(type);
        this.close();
      });
      pickerEl.appendChild(button);
    });

    // Close picker when clicking outside
    const closePicker = (e: MouseEvent) => {
      if (!pickerEl.contains(e.target as Node)) {
        this.close();
      }
    };

    // Add click handlers immediately
    document.addEventListener("click", closePicker);
    pickerEl.addEventListener("click", (e) => e.stopPropagation());

    return pickerEl;
  }

  public show(parentElement: HTMLElement): void {
    parentElement.appendChild(this.element);
  }

  public close(): void {
    this.element.remove();
    this.onClose();
  }

  public getElement(): HTMLElement {
    return this.element;
  }
}
```

Increase the message style and add emoji picker styles to `client/src/styles/main.css`:

```css
// ... this already exists ...
.message {
  padding: 10px 14px;
  margin-bottom: 32px; // update this
  border-radius: 12px;
  background-color: #f1f1f1;
  word-wrap: break-word;
  max-width: 80%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  align-self: flex-start;
  position: relative; // add this
}

.reaction-button {
  position: absolute;
  right: 8px;
  bottom: -24px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
  font-size: 0.9em;
  z-index: 10;
  color: var(--text-secondary);
}

.reaction-button:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.1);
}

.reaction-picker {
  position: absolute;
  right: 0;
  bottom: -120px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  min-width: 120px;
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  animation: fadeIn 0.2s ease-out;
}

.reaction-option {
  padding: 8px;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 4px;
  font-size: 1.2em;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
}

.reaction-option:hover {
  background-color: rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}
```

#### 8. Update ChatMessages Component (TypeScript)

Update the `ChatMessages` component in `client/src/components/ChatMessages.ts` to add all our new fields and reaction related code:

```typescript
// update imports to include the newly generated types and component
import { Reaction, ReactionEmoji, User } from "../module_bindings";
import { ReactionPicker } from "./ReactionPicker";

interface ChatMessage {
  messageId: bigint;
  senderIdentity: string;
  text: string;
  timestamp: number;
  element?: HTMLElement;
  reactions?: Reaction[];
}

interface ReactionToggleEvent {
  messageId: bigint;
  emoji: ReactionEmoji;
}

export class ChatMessages {
  private container: HTMLElement;
  private messages: ChatMessage[] = [];
  private users: Map<string, User> = new Map();
  private currentIdentity: Identity | null = null;
  private activeReactionPicker: ReactionPicker | null = null;
  private reactionToggleCallbacks: ((event: ReactionToggleEvent) => void)[] =
    [];

  // ... existing code ...

  /**
   * Register a callback for reaction toggle events
   */
  public onReactionToggle(
    callback: (event: ReactionToggleEvent) => void
  ): void {
    this.reactionToggleCallbacks.push(callback);
  }

  // ... existing code ...

  // update our addMessage for all the new fields and looks
  public addMessage({
    messageId,
    senderIdentity,
    text,
    timestamp,
    reactions = [],
  }: ChatMessage): void {
    // Create message element
    const messageEl = document.createElement("div");
    const isCurrentUser =
      this.currentIdentity?.toHexString() === senderIdentity;
    const messageTimestamp = timestamp || Date.now();

    // Set appropriate class
    messageEl.className = `message ${isCurrentUser ? "local-message" : ""}`;

    // Get sender name or fallback to identity shorthand
    const sender = this.users.get(senderIdentity);
    const senderName =
      sender?.name ||
      `User ${senderIdentity.substring(0, Constants.identity.shortLength)}`;

    // Format the timestamp
    const timeString = this.formatTime(messageTimestamp);

    // Set message content
    messageEl.innerHTML = `
      <span class="timestamp">[${timeString}]</span>
      <span class="sender">${senderName}:</span>
      <span class="text">${text}</span>
      <button class="reaction-button">😀</button>
      <div class="reactions"></div>
    `;

    const reactionButton = messageEl.querySelector(
      ".reaction-button"
    ) as HTMLButtonElement;
    reactionButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.showReactionPicker(messageEl, messageId);
    });

    // ... existing code ...

    // Store message data
    const message: ChatMessage = {
      messageId,
      senderIdentity,
      text,
      timestamp: messageTimestamp,
      element: messageEl,
      reactions,
    };
    this.messages.push(message);

    // Display initial reactions
    this.updateReactions(messageEl, reactions);
  }

  public updateMessageReactions(
    messageId: bigint,
    reactions: Reaction[]
  ): void {
    const message = this.messages.find((m) => m.messageId === messageId);
    if (message?.element) {
      this.updateReactions(message.element, reactions);
      message.reactions = reactions;
    }
  }

  private showReactionPicker(messageEl: HTMLElement, messageId: bigint): void {
    // Remove any existing reaction picker
    if (this.activeReactionPicker) {
      this.activeReactionPicker.close();
      this.activeReactionPicker = null;
    }

    // Create and show new reaction picker
    this.activeReactionPicker = new ReactionPicker(
      () => {
        this.activeReactionPicker = null;
      },
      (emoji: ReactionEmoji) => {
        // Emit event for parent to handle
        this.reactionToggleCallbacks.forEach((callback) =>
          callback({ messageId, emoji })
        );
      }
    );
    this.activeReactionPicker.show(messageEl);
  }

  public updateReactions(messageEl: HTMLElement, reactions: Reaction[]): void {
    const reactionsContainer = messageEl.querySelector(
      ".reactions"
    ) as HTMLElement;
    if (!reactionsContainer) return;

    // Clear existing reactions
    reactionsContainer.innerHTML = "";

    // Group reactions by emoji type
    const groupedReactions = reactions.reduce((acc, reaction) => {
      const key = reaction.emoji.tag;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(reaction);
      return acc;
    }, {} as Record<string, Reaction[]>);

    // Create reaction elements
    Object.entries(groupedReactions).forEach(([tag, reactions]) => {
      const reactionEl = document.createElement("div");
      reactionEl.className = "reaction";

      // Get emoji for this reaction type
      const emoji = this.getEmojiForReactionType(tag);

      // Create reaction content
      reactionEl.innerHTML = `
        <span class="reaction-emoji">${emoji}</span>
        <span class="reaction-count">${reactions.length}</span>
      `;

      // Add click handler to toggle reaction
      reactionEl.addEventListener("click", (e) => {
        e.stopPropagation();
        const reaction = reactions[0]; // Use first reaction as reference
        // Emit event for parent to handle
        this.reactionToggleCallbacks.forEach((callback) =>
          callback({ messageId: reaction.messageId, emoji: reaction.emoji })
        );
      });

      reactionsContainer.appendChild(reactionEl);
    });
  }

  private getEmojiForReactionType(tag: string): string {
    const emojiMap: Record<string, string> = {
      ThumbsUp: "👍",
      Heart: "❤️",
      Laugh: "😂",
      Party: "🎉",
      Wow: "😮",
      Rocket: "🚀",
    };
    return emojiMap[tag] || "❓";
  }

  // ... existing code ...
```

Add the following styles to `client/src/styles/main.css`:

```css
.reactions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
  margin-bottom: 4px;
}

.reaction {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  border-radius: 12px;
  background-color: var(--bg-secondary);
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.9em;
  border: 1px solid var(--border-color);
}

.reaction:hover {
  background-color: var(--bg-hover);
}

.reaction-emoji {
  font-size: 1.1em;
}

.reaction-count {
  color: var(--text-secondary);
  font-size: 0.9em;
}
```

#### 9. Update the main file (TypeScript)

Finally, we need to actually update our `src/services/main.ts` file to tie it all together:

```typescript
// Message events
dbService.onMessageInsert((message) => {
  // ... existing code ...
  // Get initial reactions
  const reactions = dbService.getReactions(message.messageId);

  // Add to chat display
  chatMessages.addMessage({
    messageId: message.messageId,
    senderIdentity: senderHex,
    text: message.text,
    timestamp: messageTimestamp,
    reactions,
  });

  // Subscribe to reaction updates for this message
  dbService.subscribeToMessageReactions(message.messageId, (reactions) => {
    chatMessages.updateMessageReactions(message.messageId, reactions);
  });
});

// Reaction events
dbService.onReactionInsert((reaction) => {
  console.log("Reaction added:", reaction);
  // The ChatMessages component will handle the update through its subscription
});

dbService.onReactionUpdate((oldReaction, newReaction) => {
  console.log("Reaction updated:", { old: oldReaction, new: newReaction });
  // The ChatMessages component will handle the update through its subscription
});

dbService.onReactionDelete((reaction) => {
  console.log("Reaction deleted:", reaction);
  // The ChatMessages component will handle the update through its subscription
});
```

This implementation provides:

1. **Clean Component Architecture**:

   - Components emit events through `onX` methods
   - Database interactions are handled in `main.ts`
   - Clear separation of concerns

2. **Real-time Updates**:

   - Reactions update instantly across all clients
   - State is managed centrally in `SpacetimeDBService`
   - Components subscribe to updates for specific messages

3. **Type Safety**:

   - All events and callbacks are properly typed
   - Clear interfaces for component communication

4. **Resource Management**:

   - Components clean up their resources
   - Event listeners are properly removed
   - Memory leaks are prevented

5. **Consistent Event Pattern**:
   - All components follow the same event emitter pattern
   - Events are handled in a central location
   - Clear data flow from UI to database

## License

MIT

## Resources

- [SpacetimeDB Documentation](https://spacetimedb.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/guide/)
