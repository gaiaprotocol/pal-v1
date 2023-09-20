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
import TokenInfoCacher from "../../cacher/TokenInfoCacher.js";
import ProfileImageDisplay from "../../component/ProfileImageDisplay.js";
import PalContract from "../../contract/PalContract.js";
import PalTokenContract from "../../contract/PalTokenContract.js";
import SupabaseManager from "../../SupabaseManager.js";
import UserManager from "../../user/UserManager.js";

export default class SellTokenPopup extends Popup {
  public content: DomNode;

  private title: DomNode;
  private priceTitle: DomNode;
  private profileImage: ProfileImageDisplay;
  private amountInput: Input;
  private priceDisplay: DomNode;
  private totalPriceDisplay: DomNode;
  private sellButton: Button;

  private symbol: string = "";

  constructor(private tokenAddress: string) {
    super({ barrierDismissible: true });
    this.append(
      this.content = new Component(
        ".sell-token-popup",
        this.title = el("h1", "Sell Token"),
        el(
          "main",
          this.profileImage = new ProfileImageDisplay({ isLarge: true }),
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
          this.sellButton = new Button({
            type: ButtonType.Text,
            tag: ".sell-token-button",
            click: async () => {
              const balance = await new PalTokenContract(
                this.tokenAddress,
              )
                .balanceOf(UserManager.userWalletAddress!);
              const amount = ethers.parseEther(this.amountInput.value);
              if (amount > balance) {
                new ErrorAlert({
                  title: "Insufficient balance",
                  message: `You need at least ${
                    ethers.formatEther(amount)
                  } ${this.symbol} to sell`,
                });
              } else {
                this.sellButton.disable();
                this.sellButton.title = "Selling...";

                try {
                  await PalContract.sellToken(
                    this.tokenAddress,
                    ethers.parseEther(this.amountInput.value),
                  );

                  SupabaseManager.supabase.functions.invoke(
                    "refresh-token-prices-and-balances",
                    {
                      body: {
                        tokenAddresses: [this.tokenAddress],
                      },
                    },
                  );

                  this.delete();
                } catch (e) {
                  console.error(e);

                  this.sellButton.enable();
                  this.sellButton.title = "Sell Token";
                }
              }
            },
            title: "Sell Token",
          }),
        ),
      ),
    );
    this.loadTokenInfo();
    this.amountInput.on("change", () => this.displayTotalPrice());
  }

  private async loadTokenInfo() {
    const tokenInfo = await TokenInfoCacher.get(this.tokenAddress);
    if (tokenInfo) {
      this.symbol = tokenInfo.symbol;
      this.title.text = `Sell ${this.symbol}`;

      const totalSupply = await new PalTokenContract(
        this.tokenAddress,
      ).totalSupply();

      if (totalSupply < 1n) {
        this.priceTitle.text = `${
          ethers.formatEther(totalSupply)
        } ${this.symbol} Price`;
        const currentPrice = await PalContract.getSellPriceAfterFee(
          this.tokenAddress,
          totalSupply,
        );
        this.priceDisplay.text = `${ethers.formatEther(currentPrice)} ETH`;
      } else {
        this.priceTitle.text = `Price per ${this.symbol}`;
        const currentPrice = await PalContract.getSellPriceAfterFee(
          this.tokenAddress,
          ethers.parseEther("1"),
        );
        this.priceDisplay.text = `${ethers.formatEther(currentPrice)} ETH`;
      }

      this.displayTotalPrice();

      this.profileImage.load(tokenInfo.owner);
    }
  }

  private async displayTotalPrice() {
    this.totalPriceDisplay.text = "Calculating...";
    this.sellButton.disable();
    this.sellButton.title = "Calculating...";

    const amount = this.amountInput.value;
    if (amount) {
      try {
        const totalPrice = await PalContract.getSellPriceAfterFee(
          this.tokenAddress,
          ethers.parseEther(amount),
        );
        this.totalPriceDisplay.text = `${ethers.formatEther(totalPrice)} ETH`;
      } catch (e) {
        console.error(e);
        this.totalPriceDisplay.text = "Invalid amount";
      }
    } else {
      this.totalPriceDisplay.text = "";
    }

    this.sellButton.enable();
    this.sellButton.title = "Sell Token";
  }
}
