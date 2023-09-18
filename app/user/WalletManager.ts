import {
  configureChains,
  createConfig,
  fetchBalance,
  getAccount,
  signMessage,
  watchAccount,
} from "@wagmi/core";
import { base, mainnet } from "@wagmi/core/chains";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/html";
import { EventContainer } from "common-dapp-module";
import Config from "../Config.js";

class WalletManager extends EventContainer {
  private web3modal!: Web3Modal;
  private _resolveConnection?: () => void;

  public connected = false;
  public get address() {
    return getAccount().address;
  }

  public init() {
    const chains = [mainnet, base];

    const { publicClient } = configureChains(chains, [
      w3mProvider({ projectId: Config.walletConnectProjectID }),
    ]);
    const wagmiConfig = createConfig({
      autoConnect: true,
      connectors: w3mConnectors({
        projectId: Config.walletConnectProjectID,
        chains,
      }),
      publicClient,
    });
    const ethereumClient = new EthereumClient(wagmiConfig, chains);
    this.web3modal = new Web3Modal({
      projectId: Config.walletConnectProjectID,
      themeVariables: {
        "--w3m-z-index": "999999",
      },
    }, ethereumClient);

    this.connected = this.address !== undefined;

    let cachedAddress = this.address;
    watchAccount((account) => {
      this.connected = account.address !== undefined;
      if (this.connected && this._resolveConnection) {
        this._resolveConnection();
      }
      if (cachedAddress !== account.address) {
        this.fireEvent("accountChanged");
        cachedAddress = account.address;
      }
    });
  }

  public async connect() {
    if (this.address !== undefined) {
      this.connected = true;
      this.fireEvent("accountChanged");
    }
    return new Promise<void>((resolve) => {
      this._resolveConnection = resolve;
      this.openModal();
    });
  }

  public openModal() {
    this.web3modal.openModal();
  }

  public async signMessage(message: string) {
    const walletAddress = this.address;
    if (!walletAddress) {
      throw new Error("Wallet is not connected");
    } else {
      return await signMessage({ message });
    }
  }

  public async getBalance(): Promise<bigint> {
    const walletAddress = this.address;
    if (!walletAddress) {
      throw new Error("Wallet is not connected");
    } else {
      const result = await fetchBalance({
        address: this.address,
      });
      return result.value;
    }
  }
}

export default new WalletManager();
