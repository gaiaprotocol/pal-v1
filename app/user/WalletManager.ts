import {
  configureChains,
  createConfig,
  getAccount,
  getNetwork,
  getWalletClient,
  signMessage,
  watchAccount,
} from "@wagmi/core";
import { mainnet } from "@wagmi/core/chains";
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/html";
import { EventContainer } from "common-dapp-module";
import { BrowserProvider, JsonRpcSigner } from "ethers";
import Config from "../Config.js";

class WalletManager extends EventContainer {
  private web3modal!: Web3Modal;
  private _resolveConnection?: () => void;

  public connected = false;
  public get address() {
    return getAccount().address;
  }

  public signer: JsonRpcSigner | undefined;

  public init() {
    const chains = [mainnet];

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
      this.createSigner();
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

  private async createSigner() {
    const walletClient = await getWalletClient();
    if (!walletClient) return;
    const { account, transport } = walletClient;
    const { chain } = getNetwork();
    if (!chain) return;
    const network = {
      chainId: chain.id,
      name: chain.name,
      ensAddress: chain.contracts?.ensRegistry?.address,
    };
    const provider = new BrowserProvider(transport, network);
    this.signer = new JsonRpcSigner(provider, account.address);
    this.fireEvent("signerChanged");
  }
}

export default new WalletManager();
