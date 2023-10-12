import {
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  Input,
  Popup,
  Router,
  WarningMessageBox,
} from "common-dapp-module";
import { ethers } from "ethers";
import PalContract from "../../contract/PalContract.js";
import SupabaseManager from "../../SupabaseManager.js";
import UserManager from "../../user/UserManager.js";

export default class CreateTokenPopup extends Popup {
  public content: DomNode;
  private createTokenButton: Button;
  private tokenNameInput: Input;
  private tokenSymbolInput: Input;
  private tokenDescriptionInput: Input;
  private viewTokenRequiredInput: Input;
  private writeTokenRequiredInput: Input;

  constructor() {
    super({ barrierDismissible: true });
    this.append(
      this.content = new Component(
        ".create-token-popup",
        el("h1", "Create Your Token"),
        el(
          "main",
          new WarningMessageBox({
            message:
              "You can create your own token. However, be cautious, as once a token is recorded on the blockchain, it cannot be deleted permanently. Although, the information of the token can be modified.",
          }),
          el(
            "form",
            this.tokenNameInput = new Input({
              label: "Name (e.g. Pal Token)",
              placeholder: "Name",
              required: true,
            }),
            this.tokenSymbolInput = new Input({
              label: "Symbol (e.g. PAL)",
              placeholder: "Symbol",
              required: true,
            }),
            this.tokenDescriptionInput = new Input({
              label: "Description",
              placeholder: "Description",
              multiline: true,
            }),
            this.viewTokenRequiredInput = new Input({
              label: "View Token Required",
              placeholder: "View Token Required",
              required: true,
              value: "1",
            }),
            this.writeTokenRequiredInput = new Input({
              label: "Write Token Required",
              placeholder: "Write Token Required",
              required: true,
              value: "1",
            }),
          ),
        ),
        el(
          "footer",
          new Button({
            type: ButtonType.Text,
            tag: ".cancel-button",
            click: () => this.delete(),
            title: "Cancel",
          }),
          this.createTokenButton = new Button({
            type: ButtonType.Text,
            tag: ".create-token-button",
            title: "Create Token",
            click: async () => {
              this.createTokenButton.disable();
              this.createTokenButton.title = "Creating...";

              try {
                const tokenAddress = await PalContract.createToken(
                  this.tokenNameInput.value,
                  this.tokenSymbolInput.value,
                );

                SupabaseManager.supabase.functions.invoke("track-events");

                if (tokenAddress) {
                  const { data, error } = await SupabaseManager.supabase
                    .functions
                    .invoke(
                      "set-token-info",
                      {
                        body: {
                          tokenAddress,
                          metadata: {
                            description: this.tokenDescriptionInput.value,
                          },
                          viewTokenRequired: ethers.parseEther(
                            this.viewTokenRequiredInput.value,
                          ).toString(),
                          writeTokenRequired: ethers.parseEther(
                            this.writeTokenRequiredInput.value,
                          ).toString(),
                        },
                      },
                    );

                  console.log(data, error);

                  if (error) {
                    throw error;
                  }

                  UserManager.setSignedUserTokenAddress(tokenAddress);

                  this.delete();
                  Router.go("/" + tokenAddress);
                }
              } catch (e) {
                console.error(e);

                this.createTokenButton.enable();
                this.createTokenButton.title = "Create Token";
              }
            },
          }),
        ),
      ),
    );
  }
}
