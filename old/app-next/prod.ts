import initialize from "./initialize.js";
import { ChainId } from "./multichain/ChainInfo.js";
await initialize({
  dev: false,
  palAddresses: {
    [ChainId.Base]: "0x6489f919432741965831f731Fa203553eA790614",
  },
});
