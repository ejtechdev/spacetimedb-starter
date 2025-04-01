/**
 * Event to be triggered when a name is submitted
 */
export interface NameSubmitEvent {
  name: string;
}

/**
 * Component for handling name input
 */
export class NameInput {
  private inputElement: HTMLInputElement;
  private submitButton: HTMLButtonElement;
  private onSubmitCallbacks: ((event: NameSubmitEvent) => void)[] = [];

  /**
   * Create a new NameInput component
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
      this.submitName();
    });

    // Handle enter key press
    this.inputElement.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        this.submitName();
      }
    });
  }

  /**
   * Submit the current name
   */
  private submitName(): void {
    const name = this.inputElement.value.trim();
    if (!name) return;

    // Notify subscribers
    this.onSubmitCallbacks.forEach((callback) => {
      callback({ name });
    });
  }

  /**
   * Register a callback for name submission
   * @param callback Function to call when a name is submitted
   */
  public onSubmit(callback: (event: NameSubmitEvent) => void): void {
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

  /**
   * Set the current value
   * @param name Name to set
   */
  public setValue(name: string): void {
    this.inputElement.value = name;
  }
}
