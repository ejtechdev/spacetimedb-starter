/**
 * Event to be triggered when a chat message is submitted
 */
export interface MessageSubmitEvent {
  text: string;
}

/**
 * Component for handling chat message input
 */
export class ChatInput {
  private inputElement: HTMLInputElement;
  private submitButton: HTMLButtonElement;
  private onSubmitCallbacks: ((event: MessageSubmitEvent) => void)[] = [];

  /**
   * Create a new ChatInput component
   * @param inputId ID of the input element
   * @param buttonId ID of the submit button
   */
  constructor(inputId: string, buttonId: string) {
    const inputElement = document.getElementById(inputId) as HTMLInputElement;
    const buttonElement = document.getElementById(
      buttonId
    ) as HTMLButtonElement;

    if (!inputElement) {
      throw new Error(`Input element with ID "${inputId}" not found`);
    }
    if (!buttonElement) {
      throw new Error(`Button element with ID "${buttonId}" not found`);
    }

    this.inputElement = inputElement;
    this.submitButton = buttonElement;

    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Set up event listeners for input and button
   */
  private setupEventListeners(): void {
    // Handle button click
    this.submitButton.addEventListener("click", () => {
      this.submitMessage();
    });

    // Handle enter key press
    this.inputElement.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        this.submitMessage();
      }
    });
  }

  /**
   * Submit the current message
   */
  private submitMessage(): void {
    const text = this.inputElement.value.trim();
    if (!text) return;

    // Notify subscribers
    this.onSubmitCallbacks.forEach((callback) => {
      callback({ text });
    });

    // Clear input
    this.inputElement.value = "";

    // Focus input again
    this.inputElement.focus();
  }

  /**
   * Register a callback for message submission
   * @param callback Function to call when a message is submitted
   */
  public onSubmit(callback: (event: MessageSubmitEvent) => void): void {
    this.onSubmitCallbacks.push(callback);
  }

  /**
   * Enable or disable the input
   * @param enabled Whether the input should be enabled
   */
  public setEnabled(enabled: boolean): void {
    this.inputElement.disabled = !enabled;
    this.submitButton.disabled = !enabled;
  }
}
