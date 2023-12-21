import { SoFiUserPublic, SoFiUserService } from "sofi-module";

class PalUserService extends SoFiUserService<SoFiUserPublic> {
  constructor() {
    super("users_public", "*", 50);
  }
}

export default new PalUserService();
