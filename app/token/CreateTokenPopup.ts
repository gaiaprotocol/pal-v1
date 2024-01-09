import {
  Button,
  ButtonType,
  Component,
  el,
  Input,
  msg,
  Popup,
  Select,
} from "@common-module/app";
import BlockchainType from "../blockchain/BlockchainType.js";
import PalContract, {
  getDeployedBlockchainsForPal,
} from "../contracts/PalContract.js";

export default class CreateTokenPopup extends Popup {
  private chainSelect: Select<BlockchainType>;
  private nameInput: Input;
  private symbolInput: Input;

  constructor() {
    super({ barrierDismissible: true });
    this.append(
      new Component(
        ".create-token-popup",
        el(
          "main",
          this.chainSelect = new Select({
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
            type: ButtonType.Text,
            tag: ".create-token",
            title: "Create Token",
            click: async () => {
              const chain = this.chainSelect.value;
              if (chain) {
                const name = this.nameInput.value;
                const symbol = this.symbolInput.value;
                const contract = new PalContract(chain);
                const tokenAddress = await contract.createToken(name, symbol);
                console.log(tokenAddress);
              }
            },
          }),
        ),
      ),
    );
  }
}
