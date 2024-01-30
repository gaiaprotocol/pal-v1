import {
  Button,
  ButtonType,
  Component,
  Confirm,
  el,
  ErrorAlert,
  Input,
  MaterialIcon,
  msg,
  Popup,
  Select,
} from "@common-module/app";
import Blockchains from "../blockchain/Blockchains.js";
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
              dom: el(
                ".option.chain",
                el("img.icon", { src: Blockchains[chain].icon }),
                Blockchains[chain].name,
              ),
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
            click: (event, button) => {
              new Confirm({
                icon: new MaterialIcon("warning"),
                title: "Important Notice",
                message:
                  "You can create your own token. However, be cautious, as once a token is recorded on the blockchain, it cannot be deleted permanently. Although, the information of the token can be modified.",
              }, async () => {
                button.loading = true;
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
                  button.loading = false;
                }
              });
            },
          }),
        ),
      ),
    );
  }
}
