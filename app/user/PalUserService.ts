import { SoFiUserPublic, SoFiUserService } from "@common-module/social";

class PalUserService extends SoFiUserService<SoFiUserPublic> {
  constructor() {
    super("users_public", "*", 50);
  }
}

export default new PalUserService();
