import {
  Button,
  ButtonType,
  Component,
  el,
  ErrorAlert,
  Input,
  LoadingSpinner,
  msg,
  Popup,
  Select,
} from "@common-module/app";
import BlockchainType from "../blockchain/BlockchainType.js";
import PalContract, {
  getDeployedBlockchainsForPal,
} from "../contracts/PalContract.js";
import TrackEventManager from "../TrackEventManager.js";

export default class CreateTokenPopup extends Popup {
  private chainSelect: Select<BlockchainType>;
  private nameInput: Input;
  private symbolInput: Input;

  constructor() {
    super({ barrierDismissible: true });
    this.append(
      new Component(
        ".create-token-popup.popup",
        el("header", el("h1", "Create Token")),
        el(
          "main",
          this.chainSelect = new Select({
            label: "Blockchain",
            placeholder: "Select a blockchain",
            options: getDeployedBlockchainsForPal().map((chain) => ({
              dom: el(".option", chain),
              value: chain,
            })),
          }),
          this.nameInput = new Input({
            label: "Name (e.g. Pal Token)",
            placeholder: "Name",
            required: true,
          }),
          this.symbolInput = new Input({
            label: "Symbol (e.g. PAL)",
            placeholder: "Symbol",
            required: true,
          }),
        ),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".cancel",
            title: msg("cancel-button"),
            click: () => this.delete(),
          }),
          new Button({
            tag: ".create-token",
            title: "Create Token",
            click: async (event, button) => {
              button.disable().title = new LoadingSpinner();
              try {
                const chain = this.chainSelect.value;
                if (!chain) throw new Error("Please select a blockchain.");

                const name = this.nameInput.value;
                const symbol = this.symbolInput.value;
                const contract = new PalContract(chain);
                const tokenAddress = await contract.createToken(name, symbol);
                console.log(tokenAddress);

                await TrackEventManager.trackEvent(chain);
                this.delete();
              } catch (e: any) {
                new ErrorAlert({
                  title: "Error",
                  message: e.message,
                });
                button.enable().title = "Create Token";
              }
            },
          }),
        ),
      ),
    );
  }
}