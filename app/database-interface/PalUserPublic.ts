import { SocialUserPublic } from "@common-module/social";

export default interface PalUserPublic extends SocialUserPublic {
  wallet_address?: string;
}
