import ImageToolkitPlugin from "src/main";
import { ContainerViewNew } from "./container.view";
import { ImgCto } from "src/model/container.to";
import { OIT_CLASS, ViewModeEnum } from "src/conf/constants";
import { Notice } from "obsidian";
import { t } from "src/lang/helpers";
import { MenuView } from "../menuView";

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
  protected checkStatus(): boolean {
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
  protected initContainerDom(bodyEl: Element): void {
    let modeContainerEl = this.imageDomManager.modeContainerEl;
    if (!modeContainerEl) {
      // 0. <div class="oit-pin"> ... <div>
      modeContainerEl = createDiv({ cls: OIT_CLASS.MODE_CONTAINER_PIN, parent: bodyEl });
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

  protected openContainer(matchedImg: ImgCto): void {
    if (!this.imageDomManager.modeContainerEl) {
      return;
    }
    matchedImg.popup = true;
    if (this.isNoPopupImg()) {
      this.imgGlobalState.activeImgZIndex = 0;
      this.activeImages.forEach(img => img.zIndex = 0);
    } else {
      matchedImg.zIndex = (++this.imgGlobalState.activeImgZIndex);
    }
    matchedImg.imgViewEl.style.zIndex = matchedImg.zIndex.toString();
    // display 'oit-pin'
    this.imageDomManager.modeContainerEl.style.display = 'block';
  }

  protected closeContainer(event?: MouseEvent, activeImg?: ImgCto | null): void {
    if (event && !activeImg) {
      // PinContainerView doesn't need click event to hide container for now
      return;
    }
    if (!this.imageDomManager.modeContainerEl) {
      return;
    }
    if (!activeImg && !(activeImg = this.imgGlobalState.activeImg)) {
      return;
    }
    // console.log('closeContainerView', event, activeImg)
    this.renderImgView(activeImg.imgViewEl, '', '');
    activeImg.popup = false;
    activeImg.mtime = 0;

    if (this.isNoPopupImg()) {
      this.imageDomManager.modeContainerEl.style.display = 'none'; // hide 'oit-pin'
      this.imgGlobalState.activeImgZIndex = 0;
      this.activeImages.forEach(img => img.zIndex = 0);
    }
    this.removeEvents(activeImg);
  }

  protected setGlobalActiveImg(imgCto: ImgCto | null): void {
    this.imgGlobalState.activeImg = imgCto;
  }

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

  protected addEvents(matchedImg: ImgCto): void {
    // this.imageDomManager.modeContainerEl.addEventListener('keydown', this.triggerKeydown);

    matchedImg.imgViewEl.addEventListener('mouseenter', this.mouseenterImgView);
    matchedImg.imgViewEl.addEventListener('mouseleave', this.mouseleaveImgView);
    // drag the image via mouse
    matchedImg.imgViewEl.addEventListener('mousedown', this.mousedownImgView);
    // zoom the image via mouse wheel
    matchedImg.imgViewEl.addEventListener('mousewheel', this.mousewheelImgView, { passive: true });
  }

  protected removeEvents(matchedImg: ImgCto): void {
    // this.imageDomManager.modeContainerEl.addEventListener('keydown', this.triggerKeydown);

    matchedImg.imgViewEl.removeEventListener('mouseenter', this.mouseenterImgView);
    matchedImg.imgViewEl.removeEventListener('mouseleave', this.mouseleaveImgView);
    // drag the image via mouse
    matchedImg.imgViewEl.removeEventListener('mousedown', this.mousedownImgView);
    // zoom the image via mouse wheel
    matchedImg.imgViewEl.removeEventListener('mousewheel', this.mousewheelImgView);
  }

  protected triggerKeydown = (event: KeyboardEvent) => {
    // console.info('keydown:', event.key, this.viewMode, this.imgGlobalState);
    if (this.isNoPopupImg()) {
      return;
    }
    if ('Escape' === event.key) {
      // close full screen, hide container view
      this.imgGlobalState.fullScreen ? this.closePlayerImg() : this.closeContainer();
    }
  }

}
