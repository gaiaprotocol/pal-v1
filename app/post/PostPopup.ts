import {
  Button,
  ButtonType,
  Component,
  el,
  MaterialIcon,
  Popup,
} from "@common-module/app";
import NewPostForm from "./NewPostForm.js";

export default class PostPopup extends Popup {
  constructor() {
    super({ barrierDismissible: true });

    this.append(
      new Component(
        ".popup.post-popup",
        el(
          "header",
          new Button({
            type: ButtonType.Text,
            tag: ".close",
            icon: new MaterialIcon("close"),
            click: () => this.delete(),
          }),
        ),
        new NewPostForm(true, () => this.delete()),
      ),
    );
  }
}
