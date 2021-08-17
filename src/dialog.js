/* -------------------------------------------- */
/*  Custom Dialog                               */
/* -------------------------------------------- */

export class YZRollDialog extends Dialog {
  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find('input').focus(ev => ev.currentTarget.select());
  }
}