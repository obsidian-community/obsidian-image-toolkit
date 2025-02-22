import { Notice } from "obsidian";
import { t } from "src/lang/helpers";
import ImageToolkitPlugin from "src/main";
import { ImgCto, ImageDomManager, ImgOprStateCto, LastClickedImgCto } from "src/model/container.to";
import { MenuView } from "../menuView";
import { IMG_DEFAULT_BACKGROUND_COLOR, IMG_FULL_SCREEN_MODE, OIT_CLASS, ViewModeEnum } from "src/conf/constants";
import { ImageUtil } from "src/util/image.util";
import { OffsetSizeIto } from "src/model/common.to";

export abstract class ContainerViewNew {

  protected readonly imageDomManager: ImageDomManager;

  protected readonly activeImages: Array<ImgCto> = new Array<ImgCto>();

  protected readonly lastClickedImg: LastClickedImgCto = new LastClickedImgCto();

  protected readonly imgGlobalState: ImgOprStateCto = new ImgOprStateCto();

  // Right click menu
  protected menuView: MenuView;

  protected constructor(
    protected readonly viewMode: ViewModeEnum,
    protected readonly plugin: ImageToolkitPlugin,
    protected readonly ownerDoc: Document,
    modeContainerEl: HTMLDivElement // 'oit-normal', 'oit-pin'
  ) {
    this.imageDomManager = new ImageDomManager(modeContainerEl);
  }

  public getOwnerDoc(): Document {
    return this.ownerDoc;
  }

  protected setGlobalActiveImg(imgCto: ImgCto | null): void {
  }

  public getPopupImgNum(): number {
    return this.activeImages.filter(img => img.popup).length;
  }

  public getLastClickedImgEl(): HTMLImageElement {
    return this.lastClickedImg.getLastClickedImg();
  }

  public getActiveImg(): ImgCto | null {
    return this.imgGlobalState.activeImg;
  }


  //#region ========== Container View & Init ==========
  /**
   * Display the clicked image (Core Entry)
   * @param imageEl the clicked image's element
   */
  public displayImage(imageEl: HTMLImageElement) {
    if (!this.checkStatus()) {
      return;
    }
    const matchedImg = this.initContainerView(imageEl, this.ownerDoc.body);
    if (!matchedImg) {
      return;
    }
    this.imgGlobalState.activeImg = matchedImg;
    this.openContainer(matchedImg);
    this.renderGalleryNavbar();
    this.refreshImg(matchedImg, imageEl.src, imageEl.alt);
    matchedImg.mtime = new Date().getTime();
  }

  protected afterRefreshImg(): void {
  }

  /**
   * initContainerDom ->
   * @param imageEl the clicked image's element
   * @param bodyEl
   * @returns
   */
  public initContainerView(imageEl: HTMLImageElement, bodyEl: Element): ImgCto | null {
    this.initContainerDom(bodyEl);
    const matchedImg = this.getMatchedImg();
    if (!matchedImg) {
      return null;
    }
    matchedImg.targetOriginalImgEl = imageEl;

    this.lastClickedImg.restoreBorderForLastClickedImg();
    this.initDefaultData(matchedImg, window.getComputedStyle(imageEl));
    this.addBorderForLastClickedImg(imageEl);
    this.addEvents(matchedImg);
    return matchedImg;
  }

  protected abstract initContainerDom(bodyEl: Element): void;

  protected abstract getMatchedImg(): ImgCto | null;

  protected abstract openContainer(matchedImg: ImgCto): void;

  protected abstract closeContainer(event?: MouseEvent, activeImg?: ImgCto | null): void;

  public unload() {
    this.lastClickedImg.restoreBorderForLastClickedImg();
  }

  /* public removeOitContainerView() {
    this.restoreBorderForLastClickedImg();
    this.removeGalleryNavbar();

    this.containerContent.modeContainerEl?.remove();
    this.containerContent.modeContainerEl = null;
    this.containerContent.imgContainerEl = null;

    this.imgGlobalStatus.dragging = false;
    this.imgGlobalStatus.popup = false;
    this.imgGlobalStatus.activeImgZIndex = 0;
    this.imgGlobalStatus.fullScreen = false;
    this.imgGlobalStatus.activeImg = null;

    // clear imgList
    this.containerContent.imgList.length = 0;
  } */

  protected checkStatus = (): boolean => {
    // none of popped-up images
    if (!this.imgGlobalState.popup) {
      return true;
    }
    // Pin mode && Cover mode
    if (ViewModeEnum.Pin === this.viewMode && this.plugin.settings.pinCoverMode) {
      return true;
    }
    // configured max images > current pop-up images
    if (this.plugin.getConfiguredPinMaximum() > this.getPopupImgNum()) {
      return true;
    }
    new Notice(t("PIN_MAXIMUM_NOTICE"));
    return false;
  }

  public initDefaultData(matchedImg: ImgCto, targetImgStyle: CSSStyleDeclaration) {
    if (targetImgStyle) {
      matchedImg.defaultImgStyle.transform = 'none';
      matchedImg.defaultImgStyle.filter = targetImgStyle.filter;
      matchedImg.defaultImgStyle.mixBlendMode = targetImgStyle.mixBlendMode;

      matchedImg.defaultImgStyle.borderWidth = targetImgStyle.borderWidth;
      matchedImg.defaultImgStyle.borderStyle = targetImgStyle.borderStyle;
      matchedImg.defaultImgStyle.borderColor = targetImgStyle.borderColor;

      this.lastClickedImg.setDefaultStyle(targetImgStyle.borderWidth, targetImgStyle.borderStyle, targetImgStyle.borderColor);
    }

    this.imgGlobalState.dragging = false;
    this.imgGlobalState.arrowUp = false;
    this.imgGlobalState.arrowDown = false;
    this.imgGlobalState.arrowLeft = false;
    this.imgGlobalState.arrowRight = false;

    matchedImg.invertColor = false;
    matchedImg.scaleX = false;
    matchedImg.scaleY = false;
    matchedImg.fullScreen = false;

    if (!this.imgGlobalState.popup) {
      this.resetClickTimer();
    }
  }

  /**
   * set 'data-oit-target' and lastClickedImgEl
   * @param targetEl
   */
  protected setLastClickedImg = (targetEl: HTMLImageElement) => {
    if (!targetEl) return;
    // 'data-oit-target' is set for locating current image
    targetEl.setAttribute('data-oit-target', '1');
    // this.lastClickedImgEl = targetEl;
  }

  protected addBorderForLastClickedImg = (targetEl: HTMLImageElement) => {
    this.lastClickedImg.setLastClickedImg(targetEl);
    if (this.plugin.settings.imageBorderToggle) {
      const lastClickedImgStyle = targetEl.style;
      if (lastClickedImgStyle) {
        lastClickedImgStyle.setProperty('border-width', this.plugin.settings.imageBorderWidth);
        lastClickedImgStyle.setProperty('border-style', this.plugin.settings.imageBorderStyle);
        lastClickedImgStyle.setProperty('border-color', this.plugin.settings.imageBorderColor);
      }
    }
  }
  //#endregion

  //#region ================== Image ========================
  protected updateImgViewElAndList() {
    if (!this.imageDomManager.imgContainerEl) {
      return;
    }
    const maxImageCount: number = this.plugin.getConfiguredPinMaximum();
    if (this.activeImages.length > maxImageCount) {
      // remove all <oit-img-container> {innerHTML} </div>
      this.imageDomManager.imgContainerEl.innerHTML = '';
      // clear activeImages
      this.activeImages.length = 0;
    }
    const curTime = new Date().getTime();
    for (let i = this.activeImages.length; i < maxImageCount; i++) {
      // <div class="oit-img-container"> `<img class='oit-img-view' data-index='0' src='' alt=''>` </div>
      const imgViewEl = createEl('img', { cls: OIT_CLASS.IMG_VIEW, parent: this.imageDomManager.imgContainerEl },
        (el) => {
          el.hidden = true; // hide 'oit-img-view' for now
          el.dataset.index = i + ''; // set data-index
        }
      );
      this.setImgViewDefaultBackground(imgViewEl);
      this.activeImages.push(new ImgCto(i, curTime, imgViewEl));
    }
  }

  /**
   * it may from: renderContainerView(), switch GalleryNavbarView, click toolbar_refresh
   * @param img
   * @param imgSrc
   * @param imgAlt
   * @param imgTitleIndex e.g. <span class="oit-img-title-index">[3/6]</span>
   */
  public refreshImg(img: ImgCto, imgSrc?: string, imgAlt?: string, imgTitleIndex?: string) {
    if (!img) {
      return;
    }
    if (!imgSrc) {
      imgSrc = img.imgViewEl.src;
    }
    if (!imgAlt) {
      imgAlt = img.imgViewEl.alt;
    }
    this.renderImgTitle(imgAlt, imgTitleIndex);

    if (!imgSrc) {
      return
    }
    img.resetRefreshImgInterval();
    const realImg = new Image();
    realImg.src = imgSrc;
    img.refreshImgInterval = setInterval((realImg) => {
      if (realImg.width > 0 || realImg.height > 0) {
        img.resetRefreshImgInterval();
        this.setImgViewPosition(ImageUtil.calculateImgZoomSize(realImg, img,
          this.ownerDoc.body.clientWidth, this.ownerDoc.body.clientHeight), 0);
        this.renderImgView(img.imgViewEl, imgSrc, imgAlt);
        this.renderImgTip(img);
        img.imgViewEl.style.transform = img.defaultImgStyle.transform;
        img.imgViewEl.style.filter = img.defaultImgStyle.filter;
        img.imgViewEl.style.mixBlendMode = img.defaultImgStyle.mixBlendMode;
        this.afterRefreshImg();
      }
    }, 40, realImg);
  }

  protected renderImgTitle = (name?: string, index?: string): void => {
  }

  protected setImgViewPosition = (imgZoomSize: ImgCto, rotate?: number) => {
    const imgViewEl = imgZoomSize.imgViewEl;
    if (!imgViewEl) return;
    if (imgZoomSize) {
      imgViewEl.setAttribute('width', imgZoomSize.curWidth + 'px');
      imgViewEl.style.setProperty('margin-top', imgZoomSize.top + 'px', 'important');
      imgViewEl.style.setProperty('margin-left', imgZoomSize.left + 'px', 'important');
    }
    const rotateDeg = rotate ? rotate : 0;
    imgViewEl.style.transform = 'rotate(' + rotateDeg + 'deg)';
    imgZoomSize.rotate = rotateDeg;
  }

  protected renderImgView = (imgViewEl: HTMLImageElement, src: string, alt: string) => {
    if (!imgViewEl) {
      return;
    }
    imgViewEl.src = src;
    imgViewEl.alt = alt;
    imgViewEl.hidden = !src && !alt;
  }

  public renderImgTip = (activeImg?: ImgCto | null) => {
    if (!activeImg)
      activeImg = this.imgGlobalState.activeImg;
    if (activeImg && this.imageDomManager.imgTipEl && activeImg.realWidth > 0 && activeImg.curWidth > 0) {
      if (this.imageDomManager.imgTipTimeout) {
        clearTimeout(this.imageDomManager.imgTipTimeout);
      }
      if (this.plugin.settings.imgTipToggle) {
        this.imageDomManager.imgTipEl.hidden = false; // display 'oit-img-tip'
        const ratio = activeImg.curWidth * 100 / activeImg.realWidth;
        const isSingleDigit: boolean = 10 > ratio;
        const width = isSingleDigit ? 20 : 40;
        const left = activeImg.left + activeImg.curWidth / 2 - width / 2;
        const top = activeImg.top + activeImg.curHeight / 2 - 10;

        this.imageDomManager.imgTipEl.style.setProperty("width", width + 'px');
        this.imageDomManager.imgTipEl.style.setProperty("font-size", isSingleDigit || 100 >= activeImg.curWidth ? 'xx-small' : 'x-small');
        this.imageDomManager.imgTipEl.style.setProperty("left", left + 'px');
        this.imageDomManager.imgTipEl.style.setProperty("top", top + 'px');
        this.imageDomManager.imgTipEl.style.setProperty("z-index", activeImg.zIndex + '');
        this.imageDomManager.imgTipEl.setText(parseInt(ratio + '') + '%');

        this.imageDomManager.imgTipTimeout = setTimeout(() => {
          this.imageDomManager.imgTipEl.hidden = true;
        }, 1000);
      } else {
        this.imageDomManager.imgTipEl.hidden = true; // hide 'oit-img-tip'
        this.imageDomManager.imgTipTimeout = null;
      }
    }
  }

  public setImgViewDefaultBackgroundForImgList() {
    for (const imgCto of this.imageDomManager.imgList) {
      this.setImgViewDefaultBackground(imgCto.imgViewEl);
    }
  }

  public setImgViewDefaultBackground(imgViewEl: HTMLImageElement) {
    if (this.plugin.settings.imgViewBackgroundColor && IMG_DEFAULT_BACKGROUND_COLOR != this.plugin.settings.imgViewBackgroundColor) {
      imgViewEl.removeClass('img-default-background');
      imgViewEl.style.setProperty('background-color', this.plugin.settings.imgViewBackgroundColor);
    } else {
      imgViewEl.addClass('img-default-background');
      imgViewEl.style.removeProperty('background-color');
    }
  }

  protected setActiveImgZIndex = (activeImg: ImgCto) => {
  }
  //#endregion

  //#region ================== Gallery NavBar ========================
  protected renderGalleryNavbar() {
  }

  protected removeGalleryNavbar() {
  }

  protected switchImageOnGalleryNavBar = (event: KeyboardEvent, next: boolean) => {
  }
  //#endregion

  //#region ================== full screen ========================
  /**
   * full-screen mode
   */
  protected showPlayerImg = (activeImg: ImgCto) => {
    this.imgGlobalState.fullScreen = true;
    activeImg.fullScreen = true;

    // show the img-player
    this.imageDomManager.imgPlayerEl.style.display = 'block';
    this.imageDomManager.imgPlayerEl.style.zIndex = (this.imgGlobalState.activeImgZIndex + 10).toString();
    this.imageDomManager.imgPlayerEl.addEventListener('click', this.closePlayerImg);

    const windowWidth = this.ownerDoc.documentElement.clientWidth || this.ownerDoc.body.clientWidth;
    const windowHeight = this.ownerDoc.documentElement.clientHeight || this.ownerDoc.body.clientHeight;
    let newWidth, newHeight;
    let top = 0, left = 0;
    if (IMG_FULL_SCREEN_MODE.STRETCH == this.plugin.settings.imgFullScreenMode) {
      newWidth = windowWidth + 'px';
      newHeight = windowHeight + 'px';
    } else if (IMG_FULL_SCREEN_MODE.FILL == this.plugin.settings.imgFullScreenMode) {
      newWidth = '100%';
      newHeight = '100%';
    } else {
      // fit
      const widthRatio = windowWidth / activeImg.realWidth;
      const heightRatio = windowHeight / activeImg.realHeight;
      if (widthRatio <= heightRatio) {
        newWidth = windowWidth;
        newHeight = widthRatio * activeImg.realHeight;
      } else {
        newHeight = windowHeight;
        newWidth = heightRatio * activeImg.realWidth;
      }
      top = (windowHeight - newHeight) / 2;
      left = (windowWidth - newWidth) / 2;
      newWidth = newWidth + 'px';
      newHeight = newHeight + 'px';
    }
    const imgPlayerImgViewEl = this.imageDomManager.imgPlayerImgViewEl;
    if (imgPlayerImgViewEl) {
      imgPlayerImgViewEl.src = activeImg.imgViewEl.src;
      imgPlayerImgViewEl.alt = activeImg.imgViewEl.alt;
      imgPlayerImgViewEl.setAttribute('width', newWidth);
      imgPlayerImgViewEl.setAttribute('height', newHeight);
      imgPlayerImgViewEl.style.marginTop = `${top}px`;
      //this.imgInfo.imgPlayerImgViewEl.style.setProperty('margin-left', left + 'px');
      this.setImgViewDefaultBackground(imgPlayerImgViewEl);
    }
  }

  /**
   * close full screen
   */
  protected closePlayerImg = () => {
    if (this.imageDomManager.imgPlayerEl) {
      // hide full screen
      this.imageDomManager.imgPlayerEl.style.display = 'none'; // hide 'img-player'
      this.imageDomManager.imgPlayerEl.removeEventListener('click', this.closePlayerImg);
    }
    if (this.imageDomManager.imgPlayerImgViewEl) {
      // clear `src` and `alt` for <img class="img-fullscreen">
      this.imageDomManager.imgPlayerImgViewEl.src = '';
      this.imageDomManager.imgPlayerImgViewEl.alt = '';
    }
    this.imgGlobalState.fullScreen = false;

    this.imageDomManager.modeContainerEl.focus();
  }
  //#endregion #full screen#

  //#region ================== events ========================
  protected abstract addEvents(matchedImg: ImgCto): void;
  protected abstract removeEvents(matchedImg: ImgCto): void;

  // protected addEvents2(matchedImg: ImgCto) {
  //   /* if (!this.imgGlobalStatus.popup) {
  //     this.ownerDoc.addEventListener('keydown', this.triggerKeydown);
  //     this.ownerDoc.addEventListener('keyup', this.triggerKeyup);
  //   } */
  //   if (this.plugin.isNormalMode()) {
  //     // click event: hide container view
  //     if (this.imageDomManager.modeContainerEl) {
  //       // this.imageDomManager.modeContainerEl.tabIndex = 0;
  //       // this.imageDomManager.modeContainerEl.focus();
  //       // this.imageDomManager.modeContainerEl.contentEditable = "true";

  //       this.imageDomManager.modeContainerEl.addEventListener('click', this.closeContainerView);

  //       this.imageDomManager.modeContainerEl.addEventListener('keydown', this.triggerKeydown);
  //       this.imageDomManager.modeContainerEl.addEventListener('keyup', this.triggerKeyup);
  //     }
  //   }
  //   matchedImg.imgViewEl.addEventListener('mouseenter', this.mouseenterImgView);
  //   matchedImg.imgViewEl.addEventListener('mouseleave', this.mouseleaveImgView);
  //   // drag the image via mouse
  //   matchedImg.imgViewEl.addEventListener('mousedown', this.mousedownImgView);
  //   matchedImg.imgViewEl.addEventListener('mouseup', this.mouseupImgView);
  //   // zoom the image via mouse wheel
  //   matchedImg.imgViewEl.addEventListener('mousewheel', this.mousewheelViewContainer, { passive: true });
  // }

  // protected removeEvents2(matchedImg: ImgCto) {
  //   if (!this.imgGlobalStatus.popup) {
  //     this.ownerDoc.removeEventListener('keydown', this.triggerKeydown);
  //     this.ownerDoc.removeEventListener('keyup', this.triggerKeyup);

  //     if (this.imgGlobalStatus.clickTimer) {
  //       clearTimeout(this.imgGlobalStatus.clickTimer);
  //       this.imgGlobalStatus.clickTimer = null;
  //       this.imgGlobalStatus.clickCount = 0;
  //     }
  //   }
  //   if (!this.plugin.isNormalMode()) {
  //     this.imageDomManager.modeContainerEl?.removeEventListener('click', this.closeContainerView);
  //   }
  //   matchedImg.imgViewEl.removeEventListener('mouseenter', this.mouseenterImgView);
  //   matchedImg.imgViewEl.removeEventListener('mouseleave', this.mouseleaveImgView);
  //   matchedImg.imgViewEl.removeEventListener('mousedown', this.mousedownImgView);
  //   matchedImg.imgViewEl.removeEventListener('mouseup', this.mouseupImgView);
  //   matchedImg.imgViewEl.removeEventListener('mousewheel', this.mousewheelViewContainer);
  //   if (matchedImg.refreshImgInterval) {
  //     clearInterval(matchedImg.refreshImgInterval);
  //     matchedImg.refreshImgInterval = null;
  //   }
  // }

  public checkHotkeySettings = (event: KeyboardEvent | MouseEvent, hotkey: string): boolean => {
    // console.log("[oit] checkHotkeySettings: ", event.ctrlKey, event.altKey, event.shiftKey)
    switch (hotkey) {
      case "NONE":
        return !event.ctrlKey && !event.altKey && !event.shiftKey;
      case "CTRL":
        return event.ctrlKey && !event.altKey && !event.shiftKey;
      case "ALT":
        return !event.ctrlKey && event.altKey && !event.shiftKey;
      case "SHIFT":
        return !event.ctrlKey && !event.altKey && event.shiftKey;
      case "CTRL_ALT":
        return event.ctrlKey && event.altKey && !event.shiftKey;
      case "CTRL_SHIFT":
        return event.ctrlKey && !event.altKey && event.shiftKey;
      case "SHIFT_ALT":
        return !event.ctrlKey && event.altKey && event.shiftKey;
      case "CTRL_SHIFT_ALT":
        return event.ctrlKey && event.altKey && event.shiftKey;
    }
    return false;
  }

  protected mouseenterImgView = (event: MouseEvent) => {
    // console.log('mouseenterImgView', event, this.imgGlobalStatus.activeImg);
    this.resetClickTimer();
    event.stopPropagation();
    event.preventDefault();
    this.getAndUpdateActiveImg(event);
  }

  protected mousedownImgView = (event: MouseEvent) => {
    // console.log('mousedownImgView', event, this.imgGlobalStatus.activeImg, event.button);
    event.stopPropagation();
    event.preventDefault();
    const activeImg = this.getAndUpdateActiveImg(event);
    if (!activeImg) {
      return;
    }
    if (0 === event.button) { // left click
      this.setClickTimer(activeImg);
      this.setActiveImgZIndex(activeImg);
      this.imgGlobalState.dragging = true;
      // 鼠标相对于图片的位置
      activeImg.moveX = activeImg.imgViewEl.offsetLeft - event.clientX;
      activeImg.moveY = activeImg.imgViewEl.offsetTop - event.clientY;
      // 鼠标按下时持续触发/移动事件
      activeImg.imgViewEl.onmousemove = this.mousemoveImgView;
    }
  }

  /**
   * move the image by mouse or keyboard
   * @param event
   * @param offsetSize
   */
  protected mousemoveImgView = (event: MouseEvent | null, offsetSize?: OffsetSizeIto) => {
    // console.log('mousemoveImgView', event, this.imgGlobalStatus.activeImg);
    const activeImg = this.imgGlobalState.activeImg;
    if (!activeImg) {
      return;
    }
    if (event) {
      if (!this.imgGlobalState.dragging) {
        return;
      }
      // drag via mouse cursor (Both Mode)
      activeImg.left = event.clientX + activeImg.moveX;
      activeImg.top = event.clientY + activeImg.moveY;
    } else if (offsetSize) {
      // move by arrow keys (Normal Mode)
      activeImg.left += offsetSize.offsetX;
      activeImg.top += offsetSize.offsetY;
    } else {
      return;
    }
    // move the image
    activeImg.imgViewEl.style.setProperty('margin-left', activeImg.left + 'px', 'important');
    activeImg.imgViewEl.style.setProperty('margin-top', activeImg.top + 'px', 'important');
  }

  protected mouseupImgView = (event: MouseEvent) => {
    // console.log('mouseupImgView', event, this.imgGlobalStatus.activeImg);
    this.imgGlobalState.dragging = false;
    event.preventDefault();
    event.stopPropagation();
    const activeImg = this.imgGlobalState.activeImg;
    if (activeImg) {
      activeImg.imgViewEl.onmousemove = null;
      if (2 == event.button) { // right click
        this.menuView?.show(event, activeImg);
      }
    }
  }

  protected mouseleaveImgView = (event: MouseEvent) => {
    // console.log('mouseleaveImgView', event, this.imgGlobalStatus.activeImg, '>>> set null');
    this.imgGlobalState.dragging = false;
    this.resetClickTimer();
    event.preventDefault();
    event.stopPropagation();
    const activeImg = this.imgGlobalState.activeImg;
    if (activeImg) {
      activeImg.imgViewEl.onmousemove = null;
      this.setGlobalActiveImg(null); // for pin mode
    }
  }

  private setClickTimer = (activeImg?: ImgCto | null) => {
    ++this.imgGlobalState.clickCount;
    if (this.imgGlobalState.clickTimer) {
      clearTimeout(this.imgGlobalState.clickTimer);
    }
    this.imgGlobalState.clickTimer = setTimeout(() => {
      const clickCount = this.imgGlobalState.clickCount;
      this.resetClickTimer();
      if (2 === clickCount) { // double click
        if (!activeImg) {
          activeImg = this.imgGlobalState.activeImg;
        }
        // console.log('mousedownImgView: double click...', activeImg.index);
        // trigger double click
        this.clickToolbar(null, this.plugin.settings.doubleClickToolbar, activeImg);
      }
    }, 200);
  }

  private resetClickTimer() {
    this.imgGlobalState.clickTimer = null;
    this.imgGlobalState.clickCount = 0;
  }

  private getAndUpdateActiveImg = (event: MouseEvent | KeyboardEvent): ImgCto | null => {
    const targetEl = (<HTMLImageElement>event.target);
    let index: string | undefined;
    if (!targetEl || !(index = targetEl.dataset.index)) {
      return null;
    }
    const activeImg: ImgCto = this.activeImages[parseInt(index)];
    if (activeImg && (!this.imgGlobalState.activeImg || activeImg.index !== this.imgGlobalState.activeImg.index)) {
      this.setGlobalActiveImg(activeImg); // update activeImg
    }
    // console.log('getAndUpdateActiveImg: ', activeImg)
    return activeImg;
  }

  protected mousewheelImgView = (event: WheelEvent) => {
    // event.preventDefault();
    event.stopPropagation();
    // @ts-ignore
    this.zoomAndRender(0 < event.wheelDelta ? 0.1 : -0.1, event);
  }

  protected zoomAndRender = (ratio: number, event?: WheelEvent | null, actualSize?: boolean, activeImg?: ImgCto | null) => {
    if (!activeImg) {
      activeImg = this.imgGlobalState.activeImg;
    }
    let activeImgViewEl: HTMLImageElement;
    if (!activeImg || !(activeImgViewEl = activeImg.imgViewEl)) {
      return;
    }
    let offsetSize: OffsetSizeIto = { offsetX: 0, offsetY: 0 };
    if (event) {
      offsetSize.offsetX = event.offsetX;
      offsetSize.offsetY = event.offsetY;
    } else {
      offsetSize.offsetX = activeImg.curWidth / 2;
      offsetSize.offsetY = activeImg.curHeight / 2;
    }
    const zoomData: ImgCto = ImageUtil.zoom(ratio, activeImg, offsetSize, actualSize);
    this.renderImgTip(activeImg);
    activeImgViewEl.setAttribute('width', zoomData.curWidth + 'px');
    activeImgViewEl.style.setProperty('margin-top', zoomData.top + 'px', 'important');
    activeImgViewEl.style.setProperty('margin-left', zoomData.left + 'px', 'important');
  }

  /**
   * Use toolbar:
   * 1. Normal Mode: click toolbar event
   * 2. Double Click Event: use default tool configured in settings
   * @param event         can be null, when '2. Double Click Event'.
   * @param targetElClass can be non-null, when '1. Normal Mode: click toolbar event'.
   * @param activeImg     can be null, when '1. Normal Mode: click toolbar event'.
   * @returns
   */
  public clickToolbar = (event: MouseEvent | null, targetElClass?: string, activeImg?: ImgCto | null) => {
    if (!targetElClass && !activeImg) {
      // 1. Normal Mode: click toolbar event
      if (!event) {
        return;
      }
      // comes from clicking toolbar
      targetElClass = (<HTMLElement>event.target).className;
      activeImg = this.imgGlobalState.activeImg;
    }
    if (!targetElClass || !activeImg) {
      return;
    }
    switch (targetElClass) {
      case 'toolbar_zoom_to_100':
        this.zoomAndRender(0, null, true, activeImg);
        break;
      case 'toolbar_zoom_in':
        this.zoomAndRender(0.1);
        break;
      case 'toolbar_zoom_out':
        this.zoomAndRender(-0.1);
        break;
      case 'toolbar_full_screen':
        this.showPlayerImg(activeImg);
        break;
      case 'toolbar_refresh':
        this.refreshImg(activeImg);
        break;
      case 'toolbar_rotate_left':
        activeImg.rotate -= 90;
        ImageUtil.transform(activeImg);
        break;
      case 'toolbar_rotate_right':
        activeImg.rotate += 90;
        ImageUtil.transform(activeImg);
        break;
      case 'toolbar_scale_x':
        activeImg.scaleX = !activeImg.scaleX;
        ImageUtil.transform(activeImg);
        break;
      case 'toolbar_scale_y':
        activeImg.scaleY = !activeImg.scaleY;
        ImageUtil.transform(activeImg);
        break;
      case 'toolbar_invert_color':
        activeImg.invertColor = !activeImg.invertColor;
        ImageUtil.invertImgColor(activeImg.imgViewEl, activeImg.invertColor);
        break;
      case 'toolbar_copy':
        ImageUtil.copyImage(activeImg.imgViewEl, activeImg.curWidth, activeImg.curHeight);
        break;
      case 'toolbar_close':
        this.closeContainer(event, activeImg);
        break
      default:
        break;
    }
  }
  //#endregion

}
