import { EventContainer } from "common-dapp-module";
import { BaseContract, ethers, Interface, InterfaceAbi } from "ethers";
import WalletManager from "../user/WalletManager.js";

export default abstract class Contract<CT extends BaseContract>
  extends EventContainer {
  protected ethersContract!: CT;
  private currentSigner?: ethers.Signer;
  public address!: string;

  constructor(private abi: Interface | InterfaceAbi) {
    super();
    this.onDelegate(
      WalletManager,
      "signerChanged",
      () => this.checkSignerChanged(),
    );
  }

  public init(address: string) {
    this.address = address;
    this.checkSignerChanged();
  }

  private checkSignerChanged() {
    if (this.currentSigner !== WalletManager.signer) {
      this.currentSigner = WalletManager.signer;
      this.ethersContract = new ethers.Contract(
        this.address,
        this.abi,
        this.currentSigner,
      ) as any;
    }
  }
}
