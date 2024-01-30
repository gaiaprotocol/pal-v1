import { EventContainer } from "@common-module/app";
import {
  configureChains,
  createConfig,
  fetchBalance,
  getAccount,
  mainnet,
  signMessage,
  watchAccount,
} from "@wagmi/core";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/html";
import { arbitrum, base, linea, optimism, scroll, zkSync } from "viem/chains";

class WalletManager extends EventContainer {
  private web3modal!: Web3Modal;
  private _resolveConnection?: () => void;
  private _rejectConnection?: (error: Error) => void;

  public connected = false;

  public get address() {
    return getAccount().address;
  }

  constructor() {
    super();
    this.addAllowedEvents("accountChanged");
  }

  public init(projectId: string) {
    const chains = [mainnet, base, arbitrum, optimism, zkSync, linea, scroll];

    const { publicClient } = configureChains(chains, [
      w3mProvider({ projectId }),
    ]);

    const wagmiConfig = createConfig({
      autoConnect: true,
      connectors: w3mConnectors({ projectId, chains }),
      publicClient,
    });

    const ethereumClient = new EthereumClient(wagmiConfig, chains);

    this.web3modal = new Web3Modal({
      projectId,
      themeMode: "dark",
      themeVariables: {
        "--w3m-accent-color": "#9B4CFF",
        "--w3m-background-color": "#9B4CFF",
        "--w3m-z-index": "999999",
      },
    }, ethereumClient);

    this.web3modal.subscribeModal((newState) => {
      if (newState.open === false && this._rejectConnection) {
        this._rejectConnection(new Error("User closed wallet modal"));
        this._rejectConnection = undefined;
        this._resolveConnection = undefined;
      }
    });

    this.connected = this.address !== undefined;

    let cachedAddress = this.address;
    watchAccount((account) => {
      this.connected = account.address !== undefined;
      if (this.connected && this._resolveConnection) {
        this._resolveConnection();
        this._resolveConnection = undefined;
        this._rejectConnection = undefined;
      }
      if (cachedAddress !== account.address) {
        this.fireEvent("accountChanged");
        cachedAddress = account.address;
      }
    });
  }

  public async signMessage(message: string) {
    if (!this.address) throw new Error("Wallet is not connected");
    return await signMessage({ message });
  }

  public async connect() {
    if (this.address !== undefined) {
      this.connected = true;
      this.fireEvent("accountChanged");
    }
    return new Promise<void>((resolve, reject) => {
      this._resolveConnection = resolve;
      this._rejectConnection = reject;
      this.web3modal.openModal();
    });
  }

  public async getBalance(): Promise<bigint> {
    if (!this.address) throw new Error("Wallet is not connected");
    const result = await fetchBalance({ address: this.address });
    return result.value;
  }
}

export default new WalletManager();
