import {
    BaseContract,
    ethers,
    Interface,
    InterfaceAbi,
  } from "https://esm.sh/ethers@6.7.0";
  import { TypedDeferredTopicFilter, TypedEventLog } from "./abi/common.ts";
  
  export default abstract class Contract<CT extends BaseContract = BaseContract> {
    protected ethersContract: CT;
    protected eventFilters: {
      [eventName: string]: TypedDeferredTopicFilter<any>;
    } = {};
    public eventTopicFilters: { [eventName: string]: ethers.TopicFilter } = {};
  
    constructor(
      address: string,
      abi: Interface | InterfaceAbi,
      signer: ethers.Signer,
      public deployBlockNumber: number,
    ) {
      this.ethersContract = new ethers.Contract(
        address,
        abi,
        signer,
      ) as any;
    }
  
    public async getEvents(
      startBlock: number,
      endBlock: number,
    ): Promise<TypedEventLog<any>[]> {
      if (Object.keys(this.eventTopicFilters).length === 0) {
        for (const eventName of Object.keys(this.eventFilters)) {
          this.eventTopicFilters[eventName] = await this.eventFilters[eventName]
            .getTopicFilter() as any;
        }
      }
      return await this.ethersContract.queryFilter(
        [Object.values(this.eventTopicFilters).flat()] as any,
        startBlock,
        endBlock,
      ) as any;
    }
  }
  