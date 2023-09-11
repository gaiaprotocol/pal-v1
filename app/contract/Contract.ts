import { EventContainer } from "common-dapp-module";
import { BaseContract, ethers, Interface, InterfaceAbi } from "ethers";
import Config from "../Config.js";
import WalletManager from "../user/WalletManager.js";

export default abstract class Contract<CT extends BaseContract>
  extends EventContainer {
  protected viewContract!: CT;
  protected writeContract!: CT;

  private currentSigner?: ethers.Signer;
  public address!: string;

  constructor(private abi: Interface | InterfaceAbi) {
    super();
  }

  public init(address: string) {
    this.address = address;

    this.viewContract = new ethers.Contract(
      this.address,
      this.abi,
      new ethers.JsonRpcProvider(Config.palRPC),
    ) as any;

    this.onDelegate(
      WalletManager,
      "signerChanged",
      () => this.checkSignerChanged(),
    );
    this.checkSignerChanged();
  }

  private checkSignerChanged() {
    if (this.currentSigner !== WalletManager.signer) {
      this.currentSigner = WalletManager.signer;
      this.writeContract = new ethers.Contract(
        this.address,
        this.abi,
        this.currentSigner,
      ) as any;
    }
  }
}
