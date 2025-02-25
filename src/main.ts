import { addIcon, Command, EventRef, Notice, Plugin, WorkspaceLeaf } from 'obsidian';
import { DEFAULT_SETTINGS, ImageToolkitSettingTab } from './setting/settings'
import { DEFAULT_VIEW_MODE, ICONS, VIEW_IMG_SELECTOR, ViewModeEnum } from './conf/constants'
import { SettingsIto } from "./model/settings.to";
import { randomUUID } from "crypto";
import { t } from './lang/helpers';
import { ContainerFactoryNew } from './factory/containerFactory-new';
import { ContainerViewNew } from './ui/container-new/container.view';

export default class ImageToolkitPlugin extends Plugin {

  public settings: SettingsIto;

  private readonly containerFactoryNew = new ContainerFactoryNew(this);

  public imgSelector: string = ``;

  private static readonly IMG_ORIGIN_CURSOR = 'data-oit-origin-cursor';

  // data-oit-event: indicate whether the window (Open in new window) has addEventListener for click.
  public static readonly POPOUT_WINDOW_EVENT = 'data-oit-popout';

  private layoutChangeEvent: EventRef;
  private windowCloseEvent: EventRef;


  async onload() {
    console.log('loading %s plugin v%s ...', this.manifest.id, this.manifest.version);

    await this.loadSettings();

    this.addSettingTab(new ImageToolkitSettingTab(this.app, this));

    this.refreshViewTrigger();

    this.listenOpenedNewWindows();

    this.registerCommands();
  }

  onunload() {
    console.log('unloading %s plugin v%s ...', this.manifest.id, this.manifest.version);
    this.layoutChangeEvent && this.app.workspace.offref(this.layoutChangeEvent);
    this.windowCloseEvent && this.app.workspace.offref(this.windowCloseEvent);

    this.containerFactoryNew.unload();

    this.removeViewTriggers(document);
  }

  private async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    await this.checkViewMode(this.getViewMode());
    this.addIcons();
  }

  public async saveSettings() {
    await this.saveData(this.settings);
  }

  private addIcons = async () => {
    for (const icon of ICONS) {
      addIcon(icon.id, icon.svg);
    }
  }

  async registerCommands() {
    this.addCommand({
      id: "oit-switch-to-normal",
      name: "Switch view mode to Normal",
      checkCallback: (checking: boolean) => {
        if (ViewModeEnum.Normal !== this.getViewMode()) {
          if (!checking) {
            this.switchViewMode(ViewModeEnum.Normal)
              .then(() => { new Notice("Switch view mode to Normal"); });
          }
          return true;
        }
        return false;
      }
    });

    this.addCommand({
      id: "oit-switch-to-pin",
      name: "Switch view mode to Pin",
      checkCallback: (checking: boolean) => {
        if (ViewModeEnum.Pin !== this.getViewMode()) {
          if (!checking) {
            this.switchViewMode(ViewModeEnum.Pin)
              .then(() => { new Notice("Switch view mode to Pin"); });
          }
          return true;
        }
        return false;
      }
    });

  }

  /**
   * Listen the windows (when: Open in new window | Close a pop-out window):
   * 1. init&add `ContainerHandler` into ContainerFactory
   * 2. add data-oit-event flag: `<body ... data-oit-event="{eventId}" ...>`
   * 3. refreshViewTrigger(ownerDoc)
   */
  private listenOpenedNewWindows() {
    // layoutChangeEvent: catch popout windows when 'Open in new Window'.
    this.layoutChangeEvent = this.app.workspace.on('layout-change', () => {
      this.app.workspace.iterateAllLeaves((leaf: WorkspaceLeaf) => {
        if (['markdown', 'image'].includes(leaf.getViewState()?.type)) {
          const ownerDoc = leaf.view.containerEl.ownerDocument;
          const ownerBodyEl = ownerDoc.body;
          let eventId = ownerBodyEl.getAttr(ImageToolkitPlugin.POPOUT_WINDOW_EVENT);
          if (ownerBodyEl.hasClass('is-popout-window') && !this.containerFactoryNew.hasPopoutContainer(eventId)) {
            if (!eventId) {
              eventId = randomUUID();
            }
            this.containerFactoryNew.addPopoutContainer(eventId, ownerDoc);
            ownerBodyEl.setAttr(ImageToolkitPlugin.POPOUT_WINDOW_EVENT, eventId);
            this.refreshViewTrigger(ownerDoc);
          }
        }
      })
    });

    // windowCloseEvent: catch closed windows to remove pop-out containers.
    this.windowCloseEvent = this.app.workspace.on('window-close', (win) => {
      console.log('window-close: data-oit-popout=', win.doc.body.getAttr(ImageToolkitPlugin.POPOUT_WINDOW_EVENT));
      const ownerBody = win.doc.body;
      if (ownerBody.hasAttribute(ImageToolkitPlugin.POPOUT_WINDOW_EVENT)) {
        const eventId = ownerBody.getAttr(ImageToolkitPlugin.POPOUT_WINDOW_EVENT);
        ownerBody.removeAttribute(ImageToolkitPlugin.POPOUT_WINDOW_EVENT);
        eventId && this.containerFactoryNew.removePopoutContainer(eventId);
      }
    });

    // In case there are already pop-out windows opened.
    this.layoutChangeEvent && this.app.workspace.tryTrigger(this.layoutChangeEvent, []);
  }

  public getViewMode(): ViewModeEnum {
    return this.settings.viewMode;
  }
  public async setViewMode(viewMode: ViewModeEnum) {
    this.settings.viewMode = viewMode;
    this.saveSettings();
  }
  private async checkViewMode(viewMode: ViewModeEnum) {
    for (const key in ViewModeEnum) {
      if (key == viewMode) {
        return;
      }
    }
    await this.setViewMode(DEFAULT_VIEW_MODE);
    console.log('[oit] Reset the view mode: %s', DEFAULT_VIEW_MODE);
    new Notice(t("RESET_VIEW_MODE"));
  }
  public isPinMode(): boolean {
    return ViewModeEnum.Pin === this.getViewMode();
  }
  public isNormalMode(): boolean {
    return ViewModeEnum.Normal === this.getViewMode();
  }

  public getAllContainerViews(): ContainerViewNew[] {
    return this.containerFactoryNew.getAllContainerViews();
  }

  private isImageElement(imgEl: HTMLImageElement): boolean {
    return imgEl && 'IMG' === imgEl.tagName;
  }

  /**
   * Check if current element is allowed to click and pop up.
   * 1. 'IMG' === targetEl.tagName
   * 2. Can get available `ContainerView` instance
   * 3. checkHotkeySettings()
   * @param targetEl
   * @param event
   * @returns
   */
  private isClickable(targetEl: HTMLImageElement, event: MouseEvent): ContainerViewNew | null {
    let container: ContainerViewNew | null;
    if (this.isImageElement(targetEl)
      && (container = this.containerFactoryNew.getContainerView(targetEl))
      && container.checkHotkeySettings(event, this.settings.viewTriggerHotkey)) {
      return container;
    }
    return null;
  }

  public async switchViewMode(viewMode: ViewModeEnum) {
    //console.log("[oit] View mode switched to:", viewMode);
    this.settings.viewMode = viewMode;
    this.saveSettings();

    //todo:switchViewMode
    /* this.getAllContainerViews().forEach(container => {
      container.removeOitContainerView();
      this.initContainer(viewMode, container.getParentContainerEl()?.getAttribute('data-oit-event'));
    }); */
  }

  /**
   * refresh images's events of click, mouseover, mouseout within itself doc
   * @param doc [Optional] when it's empty, using current document.
   * @returns
   */
  public refreshViewTrigger(doc?: Document) {
    // .workspace-leaf-content[data-type='markdown'] img,.workspace-leaf-content[data-type='image'] img
    const viewImageInEditor = this.settings.viewImageInEditor;
    // .community-modal-details img
    const viewImageInCPB = this.settings.viewImageInCPB;
    // false: ... img:not(a img)
    const viewImageWithLink = this.settings.viewImageWithLink;
    // #sr-flashcard-view img
    const viewImageOther = this.settings.viewImageOther;

    if (!doc) {
      doc = document;
    }
    this.removeViewTriggers(doc);
    if (!viewImageOther && !viewImageInEditor && !viewImageInCPB && !viewImageWithLink) {
      return;
    }
    let selector = ``;
    if (viewImageInEditor) {
      selector += (viewImageWithLink ? VIEW_IMG_SELECTOR.EDITOR_AREAS : VIEW_IMG_SELECTOR.EDITOR_AREAS_NO_LINK);
    }
    if (viewImageInCPB) {
      selector += (1 < selector.length ? `,` : ``) + (viewImageWithLink ? VIEW_IMG_SELECTOR.CPB : VIEW_IMG_SELECTOR.CPB_NO_LINK);
    }
    if (viewImageOther) {
      selector += (1 < selector.length ? `,` : ``) + (viewImageWithLink ? VIEW_IMG_SELECTOR.OTHER : VIEW_IMG_SELECTOR.OTHER_NO_LINK);
    }

    if (selector) {
      this.imgSelector = selector;
      this.addViewTriggers(doc);
    }
  }

  private addViewTriggers(doc: Document) {
    if (!this.imgSelector) {
      return;
    }
    doc.on('click', this.imgSelector, this.clickImg);
    doc.on('mouseover', this.imgSelector, this.mouseoverImg);
    doc.on('mouseout', this.imgSelector, this.mouseoutImg);
  }

  private removeViewTriggers(doc: Document) {
    if (!this.imgSelector) {
      return;
    }
    doc.off('click', this.imgSelector, this.clickImg);
    doc.off('mouseover', this.imgSelector, this.mouseoverImg);
    doc.off('mouseout', this.imgSelector, this.mouseoutImg);
  }

  private mouseoverImg = (event: MouseEvent) => {
    const targetEl = (<HTMLImageElement>event.target);
    if (!this.isClickable(targetEl, event)) {
      return;
    }
    if (null == targetEl.getAttribute(ImageToolkitPlugin.IMG_ORIGIN_CURSOR)) {
      targetEl.setAttribute(ImageToolkitPlugin.IMG_ORIGIN_CURSOR, targetEl.style.cursor || '');
    }
    // display zoom-in cursor
    targetEl.style.cursor = 'zoom-in';
  }

  private mouseoutImg = (event: MouseEvent) => {
    const targetEl = (<HTMLImageElement>event.target);
    if (!this.isClickable(targetEl, event)) {
      return;
    }
    // restore the cursor to its original style
    targetEl.style.cursor = targetEl.getAttribute(ImageToolkitPlugin.IMG_ORIGIN_CURSOR) || '';
  }

  private clickImg = (event: MouseEvent) => {
    const targetEl = <HTMLImageElement>event.target;
    this.isClickable(targetEl, event)?.displayImage(targetEl);
  }

}
