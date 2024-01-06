import openmoji from "./openmoji_list.json" assert { type: "json" };

class OpenMoji {
  public list = openmoji;

  public getEmojiURL(code: string) {
    return `https://storage.googleapis.com/gaiaprotocol/openmoji/${code}.png`;
  }
}

export default new OpenMoji();
