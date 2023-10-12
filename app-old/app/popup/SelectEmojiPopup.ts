import {
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  Popup,
  Store,
} from "common-dapp-module";
import OpenMoji from "../openmoji/OpenMoji.js";

export default class SelectEmojiPopup extends Popup {
  private settingStore = new Store("select-emoji-popup-setting");

  public content: DomNode;
  private sendButton: Button;
  private selectedEmojiButton: DomNode<HTMLButtonElement> | undefined;

  private selectedEmoji: string | undefined;

  constructor(callback: (selectedEmoji: string) => void) {
    super({ barrierDismissible: false });

    let main;
    this.append(
      this.content = new Component(
        ".select-emoji-popup",
        el("h1", "Select Emoji to Send"),
        main = el(
          "main",
          ...OpenMoji.list.map((o) => {
            const img = el<HTMLImageElement>("img.loading", {
              src: OpenMoji.getEmojiURL(o),
              loading: "lazy",
            });
            const button = el<HTMLButtonElement>("button", img as any, {
              click: () => {
                if (this.selectedEmojiButton === button) {
                  this.selectedEmojiButton?.deleteClass("selected");
                  this.selectedEmojiButton = undefined;
                  this.selectedEmoji = undefined;
                  this.sendButton.disable();
                  return;
                }
                this.selectedEmojiButton?.deleteClass("selected");
                this.selectedEmojiButton = button;
                this.selectedEmojiButton.addClass("selected");
                this.selectedEmoji = o;
                this.sendButton.enable();
              },
            });
            img.domElement.onload = () => img.deleteClass("loading");
            return button;
          }),
          {
            scroll: (event) => {
              const target = event.target as HTMLElement;
              this.settingStore.set("scrollTop", target.scrollTop, true);
            },
          },
        ),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".cancel-button",
            click: () => this.delete(),
            title: "Cancel",
          }),
          this.sendButton = new Button({
            type: ButtonType.Text,
            tag: ".send-button",
            click: async () => {
              if (!this.selectedEmoji) {
                return;
              }
              callback(this.selectedEmoji);
              this.delete();
            },
            title: "Send",
          }),
        ),
      ),
    );

    this.sendButton.disable();

    if (this.settingStore.get("scrollTop")) {
      main.domElement.scrollTop = this.settingStore.get("scrollTop")!;
    }
  }
}
