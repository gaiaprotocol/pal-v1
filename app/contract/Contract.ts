import { EventContainer } from "common-dapp-module";
import { BaseContract, ethers, Interface, InterfaceAbi } from "ethers";
import Config from "../Config.js";
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
    const signer = WalletManager.signer ??
      new ethers.VoidSigner(
        ethers.ZeroAddress,
        new ethers.JsonRpcProvider(Config.palRPC),
      );

    if (this.currentSigner !== signer) {
      this.currentSigner = signer;
      this.ethersContract = new ethers.Contract(
        this.address,
        this.abi,
        this.currentSigner,
      ) as any;
    }
  }
}
