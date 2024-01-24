import { Confirm, ErrorAlert, msg } from "@common-module/app";
import { getNetwork, getWalletClient, switchNetwork } from "@wagmi/core";
import { BaseContract, ethers, Interface, InterfaceAbi } from "ethers";
import BlockchainType from "../blockchain/BlockchainType.js";
import Blockchains from "../blockchain/Blockchains.js";
import PalSignedUserManager from "../user/PalSignedUserManager.js";
import WalletManager from "../wallet/WalletManager.js";

export default abstract class Contract<CT extends BaseContract> {
  protected viewContract: CT;

  constructor(
    private abi: Interface | InterfaceAbi,
    private chain: BlockchainType,
    private address: string,
  ) {
    this.viewContract = new ethers.Contract(
      address,
      abi,
      new ethers.JsonRpcProvider(Blockchains[chain].rpc),
    ) as any;
  }

  protected async getWriteContract(): Promise<CT> {
    if (!PalSignedUserManager.signed) {
      try {
        await new Confirm({
          title: msg("not-signed-in-title"),
          message: msg("not-signed-in-message"),
          confirmTitle: msg("not-signed-in-confirm"),
        }, () => PalSignedUserManager.signIn()).wait();
      } catch (e) {
        throw new Error("Not signed in");
      }
    }

    if (WalletManager.connected !== true) await WalletManager.connect();

    const walletClient = await getWalletClient();
    if (!walletClient) {
      new ErrorAlert({
        title: msg("no-wallet-connected-title"),
        message: msg("no-wallet-connected-message"),
      });
      throw new Error("No wallet connected");
    }

    if (!PalSignedUserManager.user?.wallet_address) {
      try {
        await new Confirm({
          title: msg("no-wallet-linked-title"),
          message: msg("no-wallet-linked-message"),
          confirmTitle: msg("no-wallet-linked-confirm"),
        }, () => PalSignedUserManager.linkWallet()).wait();
      } catch (e) {
        throw new Error("No wallet linked");
      }
    }

    const { account } = walletClient;
    if (account.address !== PalSignedUserManager.user?.wallet_address) {
      new ErrorAlert({
        title: msg("wallet-address-mismatch-title"),
        message: msg("wallet-address-mismatch-message"),
      });
      throw new Error("Wallet address mismatch");
    }

    const { chain } = getNetwork();
    if (!chain) {
      new ErrorAlert({
        title: msg("invalid-network-title"),
        message: msg("invalid-network-message", {
          chain: Blockchains[this.chain].name,
        }),
      });
      throw new Error("Invalid network");
    }

    const toChainId = Blockchains[this.chain].chainId;
    if (chain.id !== toChainId) {
      await switchNetwork({ chainId: toChainId });
    }

    const signer = await PalSignedUserManager.getContractSigner(this.chain);
    if (!signer) throw new Error("No signer");

    return new ethers.Contract(this.address, this.abi, signer) as any;
  }
}
