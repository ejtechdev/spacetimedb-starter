import { Identity } from "@clockworklabs/spacetimedb-sdk";
import { Config } from "../config/app-config";
import {
  DbConnection,
  ErrorContext,
  EventContext,
  Message,
  User,
} from "../module_bindings";

// Types for event handling
type ConnectionCallback = (identity: Identity) => void;
type DisconnectCallback = () => void;
type ErrorCallback = (error: Error) => void;
type UserInsertCallback = (user: User) => void;
type UserUpdateCallback = (oldUser: User, newUser: User) => void;
type UserDeleteCallback = (user: User) => void;
type MessageInsertCallback = (message: Message) => void;

/**
 * Service for managing SpacetimeDB connection, events, and reducer calls
 */
class SpacetimeDBService {
  private connection: DbConnection | null = null;
  private identity: Identity | null = null;
  private isConnected = false;

  // Event handlers
  private onConnectionCallbacks: ConnectionCallback[] = [];
  private onDisconnectCallbacks: DisconnectCallback[] = [];
  private onErrorCallbacks: ErrorCallback[] = [];
  private onUserInsertCallbacks: UserInsertCallback[] = [];
  private onUserUpdateCallbacks: UserUpdateCallback[] = [];
  private onUserDeleteCallbacks: UserDeleteCallback[] = [];
  private onMessageInsertCallbacks: MessageInsertCallback[] = [];

  /**
   * Connect to SpacetimeDB
   */
  public connect(): void {
    console.log("Attempting to connect to SpacetimeDB...");
    this.isConnected = false;
    this.identity = null;
    this.connection = null;

    DbConnection.builder()
      .withUri(Config.spacetimeDB.host)
      .withModuleName(Config.spacetimeDB.moduleName)
      .withToken(localStorage.getItem("auth_token") || "")
      .onConnect(this.handleConnect.bind(this))
      .onDisconnect(this.handleDisconnect.bind(this))
      .onConnectError(this.handleError.bind(this))
      .build();
  }

  /**
   * Check if currently connected to SpacetimeDB
   */
  public isConnectedToDatabase(): boolean {
    return this.isConnected;
  }

  /**
   * Get the current user's identity
   */
  public getCurrentIdentity(): Identity | null {
    return this.identity;
  }

  /**
   * Set a user's name
   * @param name The name to set
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
      console.log("Setting name:", name);
      this.connection.reducers.setName(name);
    } catch (e) {
      console.error("Error setting name:", e);
    }
  }

  /**
   * Send a chat message
   * @param text The message text to send
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
      console.log("Sending message:", text);
      this.connection.reducers.sendMessage(text);
    } catch (e) {
      console.error("Error sending message:", e);
    }
  }

  // Event listeners registration
  public onConnection(callback: ConnectionCallback): void {
    this.onConnectionCallbacks.push(callback);
  }

  public onDisconnect(callback: DisconnectCallback): void {
    this.onDisconnectCallbacks.push(callback);
  }

  public onError(callback: ErrorCallback): void {
    this.onErrorCallbacks.push(callback);
  }

  public onUserInsert(callback: UserInsertCallback): void {
    this.onUserInsertCallbacks.push(callback);
  }

  public onUserUpdate(callback: UserUpdateCallback): void {
    this.onUserUpdateCallbacks.push(callback);
  }

  public onUserDelete(callback: UserDeleteCallback): void {
    this.onUserDeleteCallbacks.push(callback);
  }

  public onMessageInsert(callback: MessageInsertCallback): void {
    this.onMessageInsertCallbacks.push(callback);
  }

  // Event handlers
  private handleConnect(
    conn: DbConnection,
    identity: Identity,
    token: string
  ): void {
    console.log("Connected to SpacetimeDB! Identity:", identity.toHexString());
    this.connection = conn;
    this.identity = identity;
    this.isConnected = true;
    localStorage.setItem("auth_token", token);

    // Register event listeners
    this.registerEventListeners(conn);

    // Subscribe to tables
    conn
      .subscriptionBuilder()
      .subscribe(["SELECT * FROM user", "SELECT * FROM message"]);

    // Notify connection listeners
    this.onConnectionCallbacks.forEach((callback) => callback(identity));
  }

  private handleDisconnect(): void {
    console.log("Disconnected from SpacetimeDB");
    this.isConnected = false;
    this.identity = null;
    this.connection = null;

    // Notify disconnection listeners
    this.onDisconnectCallbacks.forEach((callback) => callback());
  }

  private handleError(_ctx: ErrorContext, err: Error): void {
    console.error("SpacetimeDB connection error:", err);
    this.isConnected = false;
    this.identity = null;
    this.connection = null;

    // Notify error listeners
    this.onErrorCallbacks.forEach((callback) => callback(err));
  }

  private registerEventListeners(conn: DbConnection): void {
    try {
      if (conn.db?.user) {
        conn.db.user.onInsert(this.handleUserInsert.bind(this));
        conn.db.user.onUpdate(this.handleUserUpdate.bind(this));
        conn.db.user.onDelete(this.handleUserDelete.bind(this));
        console.log("User listeners attached");
      } else {
        console.warn("User table not available on connection");
      }

      if (conn.db?.message) {
        conn.db.message.onInsert(this.handleMessageInsert.bind(this));
        console.log("Message listener attached");
      } else {
        console.warn("Message table not available on connection");
      }
    } catch (e) {
      console.error("Error registering database listeners:", e);
    }
  }

  private handleUserInsert(_ctx: EventContext, user: User): void {
    this.onUserInsertCallbacks.forEach((callback) => callback(user));
  }

  private handleUserUpdate(
    _ctx: EventContext,
    oldUser: User,
    newUser: User
  ): void {
    this.onUserUpdateCallbacks.forEach((callback) =>
      callback(oldUser, newUser)
    );
  }

  private handleUserDelete(_ctx: EventContext, user: User): void {
    this.onUserDeleteCallbacks.forEach((callback) => callback(user));
  }

  private handleMessageInsert(_ctx: EventContext, message: Message): void {
    this.onMessageInsertCallbacks.forEach((callback) => callback(message));
  }
}

// Export a singleton instance
export const dbService = new SpacetimeDBService();
