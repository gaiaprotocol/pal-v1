import { SocialUserPublic, SocialUserService } from "@common-module/social";

class PalUserService extends SocialUserService<SocialUserPublic> {
  constructor() {
    super("users_public", "*", 50);
  }
}

export default new PalUserService();
