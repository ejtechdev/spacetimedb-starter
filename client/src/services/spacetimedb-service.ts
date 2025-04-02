import { Identity } from "@clockworklabs/spacetimedb-sdk";
import { Config } from "../config/app-config";
import {
  DbConnection,
  ErrorContext,
  EventContext,
  Message,
  Reaction,
  ReactionEmoji,
  User,
} from "../module_bindings";

// Types for event handling
/** Callback function type for successful connection. */
type ConnectionCallback = (identity: Identity) => void;
/** Callback function type for disconnection. */
type DisconnectCallback = () => void;
/** Callback function type for connection errors. */
type ErrorCallback = (error: Error) => void;
/** Callback function type for new user insertion. */
type UserInsertCallback = (user: User) => void;
/** Callback function type for user updates. */
type UserUpdateCallback = (oldUser: User, newUser: User) => void;
/** Callback function type for user deletion. */
type UserDeleteCallback = (user: User) => void;
/** Callback function type for new message insertion. */
type MessageInsertCallback = (message: Message) => void;
/** Callback function type for new reaction insertion. */
type ReactionInsertCallback = (reaction: Reaction) => void;
/** Callback function type for reaction updates. */
type ReactionUpdateCallback = (
  oldReaction: Reaction,
  newReaction: Reaction
) => void;
/** Callback function type for reaction deletion. */
type ReactionDeleteCallback = (reaction: Reaction) => void;

/**
 * @class SpacetimeDBService
 * Manages the connection to SpacetimeDB, handles database events,
 * and provides methods for calling database reducers (e.g., sending messages, setting names).
 * This service acts as a central point for all database interactions.
 */
class SpacetimeDBService {
  private connection: DbConnection | null = null;
  private identity: Identity | null = null;
  private isConnected = false;

  // Event handlers arrays
  private onConnectionCallbacks: ConnectionCallback[] = [];
  private onDisconnectCallbacks: DisconnectCallback[] = [];
  private onErrorCallbacks: ErrorCallback[] = [];
  private onUserInsertCallbacks: UserInsertCallback[] = [];
  private onUserUpdateCallbacks: UserUpdateCallback[] = [];
  private onUserDeleteCallbacks: UserDeleteCallback[] = [];
  private onMessageInsertCallbacks: MessageInsertCallback[] = [];
  private onReactionInsertCallbacks: ReactionInsertCallback[] = [];
  private onReactionUpdateCallbacks: ReactionUpdateCallback[] = [];
  private onReactionDeleteCallbacks: ReactionDeleteCallback[] = [];

  private messageReactions: Map<bigint, Reaction[]> = new Map();

  /**
   * Initiates a connection to the SpacetimeDB instance specified in the config.
   * Sets up internal handlers for connect, disconnect, and error events.
   */
  public connect(): void {
    console.log("Attempting to connect to SpacetimeDB...");
    this.isConnected = false;
    this.identity = null;
    this.connection = null;

    DbConnection.builder()
      .withUri(Config.spacetimeDB.host)
      .withModuleName(Config.spacetimeDB.moduleName)
      .withToken(localStorage.getItem("auth_token") || "") // Retrieve token if exists
      .onConnect(this.handleConnect.bind(this))
      .onDisconnect(this.handleDisconnect.bind(this))
      .onConnectError(this.handleError.bind(this))
      .build();
  }

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
   * Checks if the service is currently connected to SpacetimeDB.
   * @returns {boolean} True if connected, false otherwise.
   */
  public isConnectedToDatabase(): boolean {
    return this.isConnected;
  }

  /**
   * Gets the identity of the currently connected user.
   * @returns {Identity | null} The user's Identity object, or null if not connected.
   */
  public getCurrentIdentity(): Identity | null {
    return this.identity;
  }

  /**
   * Calls the `setName` reducer on the SpacetimeDB module.
   * Requires an active connection.
   * @param {string} name - The desired username.
   */
  public setUserName(name: string): void {
    if (!this.isConnected || !this.connection) {
      console.warn("Cannot set name: Not connected");
      return;
    }

    if (!name.trim()) {
      console.warn("Cannot set name: Name is empty");
      return;
    }

    try {
      console.log("Calling setName reducer with:", name);
      // Assuming a reducer named `setName` exists in the module
      this.connection.reducers.setName(name);
    } catch (e) {
      console.error("Error calling setName reducer:", e);
    }
  }

  /**
   * Calls the `sendMessage` reducer on the SpacetimeDB module.
   * Requires an active connection.
   * @param {string} text - The message content to send.
   */
  public sendMessage(text: string): void {
    if (!this.isConnected || !this.connection) {
      console.warn("Cannot send message: Not connected");
      return;
    }

    if (!text.trim()) {
      console.warn("Cannot send message: Text is empty");
      return;
    }

    try {
      console.log("Calling sendMessage reducer with:", text);
      // Assuming a reducer named `sendMessage` exists in the module
      this.connection.reducers.sendMessage(text);
    } catch (e) {
      console.error("Error calling sendMessage reducer:", e);
    }
  }

  // --- Event Listener Registration Methods ---

  /** Registers a callback for the 'connect' event. */
  public onConnection(callback: ConnectionCallback): void {
    this.onConnectionCallbacks.push(callback);
  }

  /** Registers a callback for the 'disconnect' event. */
  public onDisconnect(callback: DisconnectCallback): void {
    this.onDisconnectCallbacks.push(callback);
  }

  /** Registers a callback for connection errors. */
  public onError(callback: ErrorCallback): void {
    this.onErrorCallbacks.push(callback);
  }

  /** Registers a callback for User table insertions. */
  public onUserInsert(callback: UserInsertCallback): void {
    this.onUserInsertCallbacks.push(callback);
  }

  /** Registers a callback for User table updates. */
  public onUserUpdate(callback: UserUpdateCallback): void {
    this.onUserUpdateCallbacks.push(callback);
  }

  /** Registers a callback for User table deletions. */
  public onUserDelete(callback: UserDeleteCallback): void {
    this.onUserDeleteCallbacks.push(callback);
  }

  /** Registers a callback for Message table insertions. */
  public onMessageInsert(callback: MessageInsertCallback): void {
    this.onMessageInsertCallbacks.push(callback);
  }

  // --- Internal Event Handlers ---

  /**
   * Internal handler called by the SDK upon successful connection.
   * Stores connection details, registers table listeners, subscribes to tables,
   * and notifies registered connection callbacks.
   * @param {DbConnection} conn - The active database connection.
   * @param {Identity} identity - The identity assigned to this client.
   * @param {string} token - The authentication token.
   * @private
   */
  private handleConnect(
    conn: DbConnection,
    identity: Identity,
    token: string
  ): void {
    console.log("Connected to SpacetimeDB! Identity:", identity.toHexString());
    this.connection = conn;
    this.identity = identity;
    this.isConnected = true;
    localStorage.setItem("auth_token", token); // Store token for potential reuse

    this.registerEventListeners(conn);

    // Subscribe to necessary tables
    conn
      .subscriptionBuilder()
      .subscribe([
        "SELECT * FROM user",
        "SELECT * FROM message",
        "SELECT * FROM reaction",
      ]);

    // Notify listeners
    this.onConnectionCallbacks.forEach((callback) => callback(identity));
  }

  /**
   * Internal handler called by the SDK upon disconnection.
   * Resets connection state and notifies registered disconnection callbacks.
   * @private
   */
  private handleDisconnect(): void {
    console.log("Disconnected from SpacetimeDB");
    this.isConnected = false;
    this.identity = null;
    this.connection = null;

    // Notify listeners
    this.onDisconnectCallbacks.forEach((callback) => callback());
  }

  /**
   * Internal handler called by the SDK upon a connection error.
   * Resets connection state and notifies registered error callbacks.
   * @param {ErrorContext | unknown} _ctx - Error context (unused).
   * @param {Error} err - The connection error.
   * @private
   */
  private handleError(_ctx: ErrorContext | unknown, err: Error): void {
    console.error("SpacetimeDB connection error:", err);
    this.isConnected = false;
    this.identity = null;
    this.connection = null;

    // Notify listeners
    this.onErrorCallbacks.forEach((callback) => callback(err));
  }

  /**
   * Registers listeners for SpacetimeDB table events (insert, update, delete).
   * Called internally after a successful connection.
   * @param {DbConnection} conn - The active database connection.
   * @private
   */
  private registerEventListeners(conn: DbConnection): void {
    try {
      // Check if tables exist before attaching listeners
      if (conn.db?.user) {
        conn.db.user.onInsert(this.handleUserInsert.bind(this));
        conn.db.user.onUpdate(this.handleUserUpdate.bind(this));
        conn.db.user.onDelete(this.handleUserDelete.bind(this));
        console.log("Attached listeners for User table.");
      } else {
        console.warn(
          "User table not available on connection, cannot attach listeners."
        );
      }

      if (conn.db?.message) {
        conn.db.message.onInsert(this.handleMessageInsert.bind(this));
        console.log("Attached listeners for Message table.");
      } else {
        console.warn(
          "Message table not available on connection, cannot attach listeners."
        );
      }
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

  /** Internal handler for User table insertions. Notifies registered callbacks. */
  private handleUserInsert(_ctx: EventContext, user: User): void {
    this.onUserInsertCallbacks.forEach((callback) => callback(user));
  }

  /** Internal handler for User table updates. Notifies registered callbacks. */
  private handleUserUpdate(
    _ctx: EventContext,
    oldUser: User,
    newUser: User
  ): void {
    this.onUserUpdateCallbacks.forEach((callback) =>
      callback(oldUser, newUser)
    );
  }

  /** Internal handler for User table deletions. Notifies registered callbacks. */
  private handleUserDelete(_ctx: EventContext, user: User): void {
    this.onUserDeleteCallbacks.forEach((callback) => callback(user));
  }

  /** Internal handler for Message table insertions. Notifies registered callbacks. */
  private handleMessageInsert(_ctx: EventContext, message: Message): void {
    this.onMessageInsertCallbacks.forEach((callback) => callback(message));
  }
}

/** Singleton instance of the SpacetimeDBService. */
export const dbService = new SpacetimeDBService();
