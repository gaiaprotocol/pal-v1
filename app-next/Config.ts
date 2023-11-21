export default interface Config {
  dev: boolean;
  palAddresses: {
    [chainId: number]: string;
  };
}
