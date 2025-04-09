import ImageToolkitPlugin from "src/main";
import { ContainerViewNew } from "./container.view";
import { ImgCto } from "src/model/container.to";
import { OIT_CLASS, ViewModeEnum } from "src/conf/constants";
import { Notice } from "obsidian";
import { t } from "src/lang/helpers";

export class PinContainerNew extends ContainerViewNew {

  constructor(plugin: ImageToolkitPlugin, ownerDoc: Document, rootContainerEl: HTMLDivElement) {
    super(ViewModeEnum.Pin, plugin, ownerDoc,
      createDiv({ cls: OIT_CLASS.MODE_CONTAINER_PIN, parent: rootContainerEl }));
  }

  //@Override
  protected getMaxPopupImgCount(): number {
    return this.plugin.settings.pinMaximum;
  }

  //@Override
  protected checkImageCanPopup(): boolean {
    // none of popped-up images
    if (this.isNoPopupImg()) {
      return true;
    }
    // Pin mode && Cover mode
    if (this.plugin.settings.pinCoverMode) {
      return true;
    }
    // current pop-up images < configured max images
    if (this.getPopupImgNum() < this.plugin.settings.pinMaximum) {
      return true;
    }
    new Notice(t("PIN_MAXIMUM_NOTICE"));
    return false;
  }

  //@Override
  protected initContainerDom(): void {
    let modeContainerEl = this.imageDomManager.modeContainerEl;
    if (!modeContainerEl) {
      // 0. <div class="oit-pin"> ... <div>
      modeContainerEl = createDiv({ cls: OIT_CLASS.MODE_CONTAINER_PIN, parent: modeContainerEl });
      this.imageDomManager.modeContainerEl = modeContainerEl;
    }

    if (!this.imageDomManager.imgContainerEl) {
      // 1. <div class="oit-img-container">...</div>
      this.imageDomManager.imgContainerEl = createDiv({ cls: OIT_CLASS.IMG_CONTAINER, parent: modeContainerEl });
      // 1.1. <div class="oit-img-container"></div>
      /* create `oit-img-view` <img> element and set activeImages:
      <div class="oit-img-container">
        <img class="oit-img-view" src="" alt="" data-index="0">
        <img class="oit-img-view" src="" alt="" data-index="1">
        <img class="oit-img-view" src="" alt="" data-index="2">
      </div>
      */
      this.updateImgViewElAndList();
    }

    if (!this.imageDomManager.imgTipEl) {
      // 2. <div class="oit-img-tip"></div>
      this.imageDomManager.imgTipEl = createDiv({ cls: OIT_CLASS.IMG_TTP, parent: modeContainerEl },
        (el) => { el.hidden = true; });
    }

    if (!this.imageDomManager.imgPlayerEl) {
      // 3. <div class="img-player"> <img class='img-fullscreen' src=''> </div>
      this.imageDomManager.imgPlayerEl = createDiv({ cls: OIT_CLASS.IMG_PLAYER, parent: modeContainerEl }); // img-player for full screen mode
      this.imageDomManager.imgPlayerImgViewEl = createEl('img', { cls: OIT_CLASS.IMG_FULLSCREEN, parent: this.imageDomManager.imgPlayerEl });
    }
  }

  //@Override
  protected getMatchedImg(): ImgCto | null {
    let earliestImg: ImgCto | null = null;
    for (const img of this.activeImages) {
      if (!earliestImg || earliestImg.mtime > img.mtime) {
        earliestImg = img;
      }
      if (img.popup) {
        continue;
      }
      return img;
    }
    if (this.plugin.settings.pinCoverMode) {
      return earliestImg;
    }
    return null;
  }

  //@Override
  protected openContainer(matchedImg: ImgCto): void {
    if (!this.imageDomManager.modeContainerEl) {
      return;
    }
    matchedImg.popup = true;
    if (this.isNoPopupImg()) {
      this.imgGlobalState.activeImgZIndex = 0;
      this.activeImages.forEach(img => img.zIndex = 0);
    } else {
      matchedImg.zIndex = ++this.imgGlobalState.activeImgZIndex;
    }
    matchedImg.renderZIndex();
    // display 'oit-pin'
    this.imageDomManager.displayModeContainerEl();
  }

  /**
   * Close the specified pop-up image:
   * 1. Press 'Escape': [] from
   * 2. Click 'toolbar_close': [null, activeImg]
   *
   * @param event
   * @param activeImg
   * @returns
   */
  //@Override
  protected closeContainer(event: MouseEvent | null, activeImg: ImgCto | null): void {
    console.log('[D]closeContainer-pin:', event, activeImg, this.imgGlobalState);
    if (this.closePlayerImgEvent() || !activeImg) {
      return;
    }
    this.imgGlobalState.activeImg = null;
    activeImg.closeImgView();
    // this.renderImgView(activeImg.imgViewEl, '', '');

    if (this.isNoPopupImg()) {
      this.imageDomManager.closeModeContainerEl(); // hide 'oit-pin'
      this.imgGlobalState.activeImgZIndex = 0;
      this.activeImages.forEach(img => img.zIndex = 0);
    }
    this.removeEvents(activeImg);
  }

  //@Override
  protected setGlobalActiveImg(imgCto: ImgCto | null): void {
    this.imgGlobalState.activeImg = imgCto;
  }

  //@Override
  protected setActiveImgZIndex = (activeImg: ImgCto) => {
    let isUpdate: boolean = false;
    for (const img of this.activeImages) {
      if (activeImg.index !== img.index && activeImg.zIndex <= img.zIndex) {
        isUpdate = true;
        break;
      }
    }
    if (isUpdate) {
      activeImg.zIndex = (++this.imgGlobalState.activeImgZIndex);
      activeImg.imgViewEl.style.zIndex = `${activeImg.zIndex}`;
    }
  }

  //@Override
  protected addEvents(matchedImg: ImgCto): void {
    if (this.isNoPopupImg()) {
      this.imageDomManager.modeContainerEl.addEventListener('keydown', this.triggerKeydownEvent);
      this.imageDomManager.modeContainerEl.addEventListener('keyup', this.triggerKeyupEvent);
      this.imageDomManager.modeContainerEl.addEventListener('mousedown', this.mousedownEvent);
      window.addEventListener('blur', this.blurWindowEvent);
    }

    matchedImg.imgViewEl.addEventListener('mouseenter', this.mouseenterImgViewEvent);
    matchedImg.imgViewEl.addEventListener('mouseleave', this.mouseleaveImgViewEvent);
    // zoom the image via mouse wheel
    matchedImg.imgViewEl.addEventListener('mousewheel', this.mousewheelImgViewEvent, { passive: true });
  }

  //@Override
  protected removeEvents(matchedImg: ImgCto): void {
    if (this.isNoPopupImg()) {
      this.imageDomManager.modeContainerEl.removeEventListener('keydown', this.triggerKeydownEvent);
      this.imageDomManager.modeContainerEl.removeEventListener('keyup', this.triggerKeyupEvent);
      this.imageDomManager.modeContainerEl.removeEventListener('mousedown', this.mousedownEvent);
      window.removeEventListener('blur', this.blurWindowEvent);
    }

    matchedImg.imgViewEl.removeEventListener('mouseenter', this.mouseenterImgViewEvent);
    matchedImg.imgViewEl.removeEventListener('mouseleave', this.mouseleaveImgViewEvent);
    // zoom the image via mouse wheel
    matchedImg.imgViewEl.removeEventListener('mousewheel', this.mousewheelImgViewEvent);
  }

  protected triggerKeydown = (event: KeyboardEvent) => {
    console.info('[D]keydown:', event.key, this.viewMode, this.imgGlobalState);
    if (this.isNoPopupImg()) {
      return;
    }
    if ('Escape' === event.key) {
      // close full screen, hide container view
      this.closeContainer(null, this.imgGlobalState.activeImg);
    }
  }

  protected blurWindowEvent = (event: Event) => {
    console.info('[D]blurWindowEvent-pin:', event);
    this.imgGlobalState.activeImg = null;
    this.activeImages.forEach(img => img.imgViewEl.removeClass('active'));
  }

  protected mousedownEvent = (event: MouseEvent) => {
    const target = <HTMLElement>event.target;
    console.log('[D]mousedownDocEvent:', "'" + target?.classList.value + "'", 'dragging=' + this.imgGlobalState.dragging);
    this.activeImages.forEach(img => img.imgViewEl.removeClass('active'));
    if (!target?.hasClass(OIT_CLASS.IMG_VIEW)) {
      this.imgGlobalState.activeImg = null;
      return;
    }
    // Click on the pop-up 'oit-img-view'
    target.addClass('active');
    this.mousedownImgViewEvent(event);
  }

}
