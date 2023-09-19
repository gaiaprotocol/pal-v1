import {
  Button,
  ButtonType,
  Component,
  DomNode,
  el,
  ErrorAlert,
  Input,
  Popup,
} from "common-dapp-module";
import { ethers } from "ethers";
import ProfileImageDisplay from "../../component/ProfileImageDisplay.js";
import Constants from "../../Constants.js";
import PalContract from "../../contract/PalContract.js";
import SupabaseManager from "../../SupabaseManager.js";
import WalletManager from "../../user/WalletManager.js";

export default class BuyTokenPopup extends Popup {
  public content: DomNode;

  private title: DomNode;
  private priceTitle: DomNode;
  private profileImage: ProfileImageDisplay;
  private amountInput: Input;
  private priceDisplay: DomNode;
  private totalPriceDisplay: DomNode;
  private buyButton: Button;

  private totalPrice: bigint = 0n;

  constructor(private tokenAddress: string) {
    super({ barrierDismissible: true });
    this.append(
      this.content = new Component(
        ".buy-token-popup",
        this.title = el("h1", "Buy Token"),
        el(
          "main",
          this.profileImage = new ProfileImageDisplay(true),
          this.amountInput = new Input({
            label: "Amount",
            placeholder: "Amount",
            required: true,
          }),
          el(
            "table",
            el(
              "tr",
              this.priceTitle = el("th", "Price"),
              this.priceDisplay = el("td"),
            ),
            el(
              "tr",
              el("th", "Total (including fee)"),
              this.totalPriceDisplay = el("td"),
            ),
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
          this.buyButton = new Button({
            type: ButtonType.Text,
            tag: ".buy-token-button",
            click: async () => {
              const balance = await WalletManager.getBalance();
              if (balance < this.totalPrice) {
                new ErrorAlert({
                  title: "Insufficient balance",
                  message: `You need at least ${
                    ethers.formatEther(this.totalPrice)
                  } ETH to buy this token`,
                });
              } else {
                this.buyButton.disable();
                this.buyButton.title = "Buying...";

                try {
                  await PalContract.buyToken(
                    this.tokenAddress,
                    ethers.parseEther(this.amountInput.value),
                    this.totalPrice,
                  );
                  this.fireEvent("buyToken");
                  this.delete();
                } catch (e) {
                  console.error(e);

                  this.buyButton.enable();
                  this.buyButton.title = "Buy Token";
                }
              }
            },
            title: "Buy Token",
          }),
        ),
      ),
    );
    this.loadTokenInfo();
    this.amountInput.on("change", () => this.displayTotalPrice());
  }

  private async loadTokenInfo() {
    const { data: tokenData } = await SupabaseManager.supabase.from(
      "pal_tokens",
    )
      .select(
        Constants.PAL_TOKENS_SELECT_QUERY,
      )
      .eq("token_address", this.tokenAddress).single();

    if (tokenData) {
      this.title.text = `Buy ${(tokenData as any).symbol}`;
      this.priceTitle.text = `Price per ${(tokenData as any).symbol}`;

      const currentPrice = await PalContract.getBuyPriceAfterFee(
        this.tokenAddress,
        ethers.parseEther("1"),
      );

      this.priceDisplay.text = `${ethers.formatEther(currentPrice)} ETH`;
      this.displayTotalPrice();

      this.profileImage.load((tokenData as any).owner);
    }
  }

  private async displayTotalPrice() {
    this.totalPriceDisplay.text = "Calculating...";
    this.buyButton.disable();
    this.buyButton.title = "Calculating...";

    const amount = this.amountInput.value;
    if (amount) {
      try {
        this.totalPrice = await PalContract.getBuyPriceAfterFee(
          this.tokenAddress,
          ethers.parseEther(amount),
        );
        this.totalPriceDisplay.text = `${
          ethers.formatEther(this.totalPrice)
        } ETH`;
      } catch (e) {
        console.error(e);
        this.totalPriceDisplay.text = "Invalid amount";
      }
    } else {
      this.totalPriceDisplay.text = "";
    }

    this.buyButton.enable();
    this.buyButton.title = "Buy Token";
  }
}
