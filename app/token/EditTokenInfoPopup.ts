import {
  Button,
  ButtonType,
  Component,
  el,
  ErrorAlert,
  Input,
  msg,
  Popup,
} from "@common-module/app";
import PalUserTokenContract from "../contracts/PalUserTokenContract.js";
import Token from "../database-interface/Token.js";

export default class EditTokenInfoPopup extends Popup {
  private nameInput: Input;
  private symbolInput: Input;

  constructor(private token: Token) {
    super({ barrierDismissible: true });
    this.append(
      new Component(
        ".edit-token-info-popup.popup",
        el("header", el("h1", "Edit Token Info")),
        el(
          "main",
          el(
            "form.name-form",
            { submit: (event) => event.preventDefault() },
            this.nameInput = new Input({
              label: "Name (e.g. Pal Token)",
              placeholder: "Name",
              value: token.name,
              required: true,
            }),
            el(
              "footer",
              new Button({
                title: "Save Name",
                click: async (event, button) => {
                  button.loading = true;
                  try {
                    await this.saveName();
                  } catch (e: any) {
                    new ErrorAlert({ title: "Error", message: e.message });
                  }
                  button.loading = false;
                },
              }),
            ),
          ),
          el(
            "form.name-form",
            { submit: (event) => event.preventDefault() },
            this.symbolInput = new Input({
              label: "Symbol (e.g. PAL)",
              placeholder: "Symbol",
              value: token.symbol,
              required: true,
            }),
            el(
              "footer",
              new Button({
                title: "Save Symbol",
                click: async (event, button) => {
                  button.loading = true;
                  try {
                    await this.saveSymbol();
                  } catch (e: any) {
                    new ErrorAlert({ title: "Error", message: e.message });
                  }
                  button.loading = false;
                },
              }),
            ),
          ),
        ),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".cancel",
            title: msg("cancel-button"),
            click: () => this.delete(),
          }),
        ),
      ),
    );

    this.nameInput.select();
  }

  private async saveName() {
    const contract = new PalUserTokenContract(
      this.token.chain,
      this.token.token_address,
    );
    await contract.setName(this.nameInput.value);
  }

  private async saveSymbol() {
    const contract = new PalUserTokenContract(
      this.token.chain,
      this.token.token_address,
    );
    await contract.setSymbol(this.symbolInput.value);
  }
}
