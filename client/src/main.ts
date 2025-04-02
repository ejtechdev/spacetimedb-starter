/**
 * @fileoverview Main entry point for the SpacetimeDB chat client application.
 * Initializes UI components, sets up event handlers, and manages the connection
 * to the SpacetimeDB service.
 */

import { Identity } from "@clockworklabs/spacetimedb-sdk";
import { ChatInput, MessageSubmitEvent } from "./components/ChatInput";
import { ChatMessages } from "./components/ChatMessages";
import { NameInput, NameSubmitEvent } from "./components/NameInput";
import { UsersList } from "./components/UsersList";
import { Constants } from "./config/constants";
import { User } from "./module_bindings";
import { dbService } from "./services/spacetimedb-service";
import "./styles/main.css";

// Import Vite default asset (optional, for demonstration)
import "/vite.svg";

// --- Global State ---
/** Map storing user data, keyed by user identity hex string. */
let users = new Map<string, User>();
/** Map storing message history per user, keyed by sender identity hex string. */
let playerMessages = new Map<string, { text: string; timestamp: number }[]>();

// --- UI Component Instances ---
/** Instance of the UsersList component. */
let usersList: UsersList;
/** Instance of the ChatMessages component. */
let chatMessages: ChatMessages;
/** Instance of the ChatInput component. */
let chatInput: ChatInput;
/** Instance of the NameInput component. */
let nameInput: NameInput;
/** HTML element displaying the connection status. */
let connectionStatusElement: HTMLElement;

/**
 * Initializes the application.
 * - Fetches necessary DOM elements.
 * - Creates instances of UI components.
 * - Sets up event handlers for user interactions and database events.
 * - Initiates the connection to SpacetimeDB.
 */
function initializeApp() {
  console.log("Initializing application...");

  // Get DOM elements required by components
  const messageContainer = document.getElementById("message-container");
  const usersListContainer = document.getElementById("users-list");
  const chatInputElement = document.getElementById("chat-input");
  const chatSendButton = document.getElementById("send-button");
  const nameInputElement = document.getElementById("name-input");
  const nameSetButton = document.getElementById("set-name-button");
  const statusElement = document.getElementById("connection-status");

  // Verify all required elements are found
  if (
    !messageContainer ||
    !usersListContainer ||
    !chatInputElement ||
    !chatSendButton ||
    !nameInputElement ||
    !nameSetButton ||
    !statusElement
  ) {
    console.error(
      "Initialization failed: Required DOM elements not found. Check IDs in index.html and main.ts."
    );
    // Log which elements are missing for easier debugging
    console.debug({
      messageContainer,
      usersListContainer,
      chatInputElement,
      chatSendButton,
      nameInputElement,
      nameSetButton,
      statusElement,
    });
    return;
  }
  connectionStatusElement = statusElement; // Assign the found status element

  // Initialize UI components (using the correct IDs)
  try {
    usersList = new UsersList("users-list");
    chatMessages = new ChatMessages("message-container");
    chatInput = new ChatInput("chat-input", "send-button");
    nameInput = new NameInput("name-input", "set-name-button");
  } catch (error) {
    console.error("Failed to initialize UI components:", error);
    return;
  }

  // Initial UI state (inputs disabled until connected)
  chatInput.setEnabled(false);
  nameInput.setEnabled(false);

  // Setup event handlers
  setupEventHandlers();
  setupDatabaseEventHandlers();

  // Connect to SpacetimeDB
  connectToSpacetimeDB();

  console.log("Application initialized.");
}

/**
 * Sets up event listeners for UI component interactions (message sending, name setting).
 */
function setupEventHandlers() {
  chatInput.onSubmit((event: MessageSubmitEvent) => {
    console.log("Chat input submitted:", event.text);
    dbService.sendMessage(event.text);
  });

  nameInput.onSubmit((event: NameSubmitEvent) => {
    console.log("Name input submitted:", event.name);
    dbService.setUserName(event.name);
  });

  chatMessages.onReactionToggle((event) => {
    console.log("Reaction toggle:", event);
    dbService.toggleReaction(event.messageId, event.emoji);
  });
}

/**
 * Sets up event listeners for SpacetimeDB events provided by the `dbService`.
 * Handles connection status changes, user updates, and new messages.
 */
function setupDatabaseEventHandlers() {
  // Connection events
  dbService.onConnection((identity: Identity) => {
    console.log("Connected to SpacetimeDB");
    connectionStatusElement.textContent = Constants.textLabels.connected;

    // Update UI state
    chatInput.setEnabled(true);
    nameInput.setEnabled(true);
    chatMessages.setCurrentIdentity(identity);
    usersList.setCurrentIdentity(identity);

    // Populate initial state if needed (e.g., existing users/messages)
    // This part might need adjustment based on how initial state is handled
  });

  dbService.onDisconnect(() => {
    console.log("Disconnected from SpacetimeDB");
    connectionStatusElement.textContent = Constants.textLabels.disconnected;

    // Update UI state
    chatInput.setEnabled(false);
    nameInput.setEnabled(false);
    chatMessages.setCurrentIdentity(null);
    usersList.setCurrentIdentity(null);

    // Clear local state
    users.clear();
    playerMessages.clear();
    usersList.updateUsers(users);
    // Consider clearing chatMessages display as well

    // Attempt to reconnect after a delay
    console.log("Attempting to reconnect in 5 seconds...");
    setTimeout(connectToSpacetimeDB, 5000);
  });

  dbService.onError((error: Error) => {
    console.error("SpacetimeDB connection error:", error);
    connectionStatusElement.textContent = `${Constants.textLabels.errorPrefix}${error.message}`;

    // Update UI state
    chatInput.setEnabled(false);
    nameInput.setEnabled(false);
  });

  // User events
  dbService.onUserInsert((user: User) => {
    const userIdHex = user.identity.toHexString();

    // Update users map
    const nextUsers = new Map(users);
    nextUsers.set(userIdHex, user);
    users = nextUsers;

    // Update components
    usersList.updateUsers(users);
    chatMessages.setUsers(users); // Ensure chat messages can resolve names
  });

  dbService.onUserUpdate((oldUser: User, newUser: User) => {
    const oldUserIdHex = oldUser.identity.toHexString();
    const newUserIdHex = newUser.identity.toHexString();
    console.log(
      `User updated: ${newUserIdHex.substring(
        0,
        Constants.identity.shortLength
      )} (Online: ${newUser.online})`
    );

    // Update users map
    const nextUsers = new Map(users);
    nextUsers.set(newUserIdHex, newUser);
    // If identity somehow changed (shouldn't typically happen for updates),
    // remove the old one.
    if (oldUserIdHex !== newUserIdHex) {
      nextUsers.delete(oldUserIdHex);
    }
    users = nextUsers;

    // Update components
    usersList.updateUsers(users);
    chatMessages.setUsers(users);
  });

  dbService.onUserDelete((user: User) => {
    const userIdHex = user.identity.toHexString();
    console.log(
      `User deleted: ${userIdHex.substring(0, Constants.identity.shortLength)}`
    );

    // Update users map
    const nextUsers = new Map(users);
    nextUsers.delete(userIdHex);
    users = nextUsers;

    // Update components
    usersList.updateUsers(users);
    chatMessages.setUsers(users);
  });

  // Message events
  dbService.onMessageInsert((message) => {
    if (!message.sender) {
      console.warn("Received message without sender identity.");
      return;
    }

    const senderHex = message.sender.toHexString();
    const messageTimestamp = message.sent
      ? Math.floor(Number(message.sent.microsSinceUnixEpoch) / 1000)
      : Date.now(); // Fallback to current time if sent timestamp is missing

    const newMessage = {
      text: message.text,
      timestamp: messageTimestamp,
    };

    // Store in message history (optional, could be simplified if not needed)
    const nextMessages = new Map(playerMessages);
    const currentMessages = nextMessages.get(senderHex) || [];
    nextMessages.set(senderHex, [...currentMessages, newMessage]);
    playerMessages = nextMessages;

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
}

/**
 * Initiates the connection process using the `dbService`.
 * Updates the connection status UI element.
 */
function connectToSpacetimeDB() {
  console.log("Connecting to SpacetimeDB...");
  connectionStatusElement.textContent = Constants.textLabels.connecting;
  dbService.connect();
}

// --- Application Start ---
document.addEventListener("DOMContentLoaded", initializeApp);
