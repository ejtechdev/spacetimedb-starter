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
