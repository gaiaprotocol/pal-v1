import { EventContainer } from "common-dapp-module";
import { BaseContract, ethers, Interface, InterfaceAbi } from "ethers";
import Config from "../Config.js";
import UserManager from "../user/UserManager.js";

export default abstract class Contract<CT extends BaseContract>
  extends EventContainer {
  protected viewContract!: CT;

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
  }

  protected async getWriteContract(): Promise<CT | undefined> {
    const signer = await UserManager.getSigner();
    if (signer) {
      return new ethers.Contract(
        this.address,
        this.abi,
        signer,
      ) as any;
    }
  }
}
