import initialize from "./initialize.js";
import { ChainId } from "./multichain/ChainInfo.js";
await initialize({
  dev: true,
  palAddresses: {
    [ChainId.Base]: "0xcF18D57f24C067C00Fa83CC4e8fE1C134177047A",
  },
});
