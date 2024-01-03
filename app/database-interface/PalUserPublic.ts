import { SoFiUserPublic } from "@common-module/social";

export default interface PalUserPublic extends SoFiUserPublic {
  wallet_address?: string;
}
