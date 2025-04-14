import ImageToolkitPlugin from "src/main";
import { ImgCto, ImageDomManager, ImgOprStateCto, LastClickedImgCto } from "src/model/container.to";
import { MenuView } from "../menuView";
import { IMG_DEFAULT_BACKGROUND_COLOR, IMG_FULL_SCREEN_MODE, OIT_CLASS, ViewModeEnum } from "src/conf/constants";
import { ImageUtil } from "src/util/image.util";
import { OffsetSizeIto } from "src/model/common.to";
import { ImageHandler, ImageHandlerFactory } from "./handler/imageHandler";
import { EventHandlerFactory, IEventHandler } from "./handler/eventHandler";


export abstract class ContainerViewNew {

  protected readonly imageHandler: ImageHandler;
  protected readonly eventHandler: IEventHandler;

  public readonly imageDomManager: ImageDomManager;

  protected readonly lastClickedImg: LastClickedImgCto = new LastClickedImgCto();

  protected readonly imgGlobalState: ImgOprStateCto = new ImgOprStateCto();

  // Right click menu
  public readonly menuView: MenuView = new MenuView(this)

  protected constructor(
    protected readonly viewMode: ViewModeEnum,
    protected readonly plugin: ImageToolkitPlugin,
    ownerDoc: Document,
    modeContainerEl: HTMLDivElement // 'oit-normal', 'oit-pin': second level under 'oit'
  ) {
    this.imageDomManager = new ImageDomManager(ownerDoc, modeContainerEl);
    this.imageHandler = ImageHandlerFactory.createImageHandler(viewMode, this.imageDomManager);
    this.eventHandler = EventHandlerFactory.createEventHandler(viewMode, this.imageDomManager, this, this.imgGlobalState);
  }

  public getOwnerDoc(): Document {
    return this.imageDomManager.ownerDoc;
  }

  protected abstract getMaxPopupImgCount(): number;

  public getGlobalActiveImg(): ImgCto | null {
    return this.imgGlobalState.activeImg;
  }

  protected setGlobalActiveImg(imgCto: ImgCto | null): void {
  }

  //#region ↓↓↓↓↓ LastClickedImg ↓↓↓↓↓
  public getLastClickedImgEl(): HTMLImageElement {
    return this.lastClickedImg.getLastClickedImg();
  }
  //#endregion ↑↑↑↑↑ LastClickedImg ↑↑↑↑↑


  //#region ↓↓↓↓↓ Container View&Init ↓↓↓↓↓
  /**
   * Display the clicked image (Core Entry):
   * 1. checkImageCanPopup()
   * 2. initContainer():
   *   2.1. initContainerDom(): init container dom and bind events
   *   2.2. getMatchedImg(): get the matched img that can be rendered
   *   2.3. addBorderForLastClickedImg(): add border for the last clicked image
   *   2.4. addEvents(): add events for the matched img
   * 3. set global active img
   * 4. openContainer(): -> displayModeContainerEl()
   * 5. renderGalleryNavbar(): only for Normal mode
   * 6. refreshImg()
   *
   * @param imageEl the clicked image's element
   */
  public displayImage(imageEl: HTMLImageElement) {
    console.log('[D]displayImage:', imageEl);
    if (!this.checkImageCanPopup()) {
      return;
    }
    const matchedImg = this.initContainer(imageEl);
    if (!matchedImg) {
      console.warn('[oit] Found no matched image!', imageEl);
      return;
    }
    this.imgGlobalState.activeImg = matchedImg;
    this.openContainer(matchedImg);
    // this.renderGalleryNavbar();
    this.imageHandler.refreshImg(matchedImg);
  }

  /**
   * initContainerDom ->
   * @param imageEl the clicked image's element
   * @param bodyEl
   * @returns {ImgCto | null} Returns the matched img that can be rendered.
   */
  public initContainer(imageEl: HTMLImageElement): ImgCto | null {
    const matchedImg = this.initContainerDom();
    if (!matchedImg) {
      return null;
    }
    //matchedImg.targetOriginalImgEl = imageEl;

    this.lastClickedImg.restoreBorderForLastClickedImg();
    this.initDefaultData(matchedImg, window.getComputedStyle(imageEl));
    this.addBorderForLastClickedImg(imageEl);

    //this.addEvents(matchedImg);
    this.eventHandler.init(matchedImg);

    matchedImg.alt = imageEl.alt;
    matchedImg.src = imageEl.src;

    return matchedImg;
  }

  /**
   * Checks if the current image's status allows it to be displayed.
   *
   * @returns {boolean} - Returns `true` if the image can be displayed in a preview, otherwise `false`.
   */
  protected abstract checkImageCanPopup(): boolean;

  protected abstract initContainerDom(): ImgCto;

  /* protected abstract getMatchedImg(): ImgCto | null; */

  protected abstract openContainer(matchedImg: ImgCto): void;

  protected closeContainerEvent = (event: MouseEvent): void => {
    const activeImg = this.imgGlobalState.activeImg;
    if (activeImg) {
      this.closeContainer(event, activeImg);
    }
  }

  public abstract closeContainer(event: MouseEvent | null, activeImg: ImgCto | null): void;

  public unload() {
    this.lastClickedImg.restoreBorderForLastClickedImg();
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

    if (this.imageHandler.isNoPopupImg()) {
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
  //#endregion ↑↑↑↑↑ Container View & Init ↑↑↑↑↑


  //#region ================== Image ========================
  /* protected updateImgViewElAndList() {
    if (!this.imageDomManager.imgContainerEl) {
      return;
    }
    const maxImageCount: number = this.getMaxPopupImgCount();
    const activeImages = this.imageHandler.activeImages;
    if (activeImages.length > maxImageCount) {
      // remove all <oit-img-container> {innerHTML} </div>
      this.imageDomManager.imgContainerEl.innerHTML = '';
      // clear activeImages
      activeImages.length = 0;
    }
    const curTime = new Date().getTime();
    for (let i = activeImages.length; i < maxImageCount; i++) {
      // <div class="oit-img-container"> `<img class='oit-img-view' data-index='0' src='' alt=''>` </div>
      const imgViewEl = createEl('img', { cls: OIT_CLASS.IMG_VIEW, parent: this.imageDomManager.imgContainerEl, attr: { tabIndex: 0 } },
        (el) => {
          el.hidden = true; // hide 'oit-img-view' for now
          el.dataset.index = i + ''; // set data-index
        }
      );
      this.setImgViewDefaultBackground(imgViewEl);
      activeImages.push(new ImgCto(i, curTime, imgViewEl));
    }
  } */

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
        const left = activeImg.imgX + activeImg.curWidth / 2 - width / 2;
        const top = activeImg.imgY + activeImg.curHeight / 2 - 10;

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
    for (const imgCto of this.imageHandler.activeImages) {
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

  public setActiveImgZIndex = (activeImg: ImgCto) => {
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
   * Show Full-screen mode
   */
  protected showPlayerImg = (activeImg: ImgCto) => {
    console.log('[D]showPlayerImg:', activeImg);
    this.imgGlobalState.fullScreen = true;
    activeImg.fullScreen = true;

    // show the img-player
    this.imageDomManager.imgPlayerEl.style.display = 'block';
    this.imageDomManager.imgPlayerEl.style.zIndex = (this.imgGlobalState.activeImgZIndex + 10).toString();
    this.imageDomManager.imgPlayerEl.addEventListener('click', this.closePlayerImgEvent);

    // const windowWidth = this.ownerDoc.documentElement.clientWidth || this.ownerDoc.body.clientWidth;
    // const windowHeight = this.ownerDoc.documentElement.clientHeight || this.ownerDoc.body.clientHeight;
    const windowWidth = this.imageDomManager.ownerDoc.documentElement.clientWidth || this.imageDomManager.ownerDoc.body.clientWidth;
    const windowHeight = this.imageDomManager.ownerDoc.documentElement.clientHeight || this.imageDomManager.ownerDoc.body.clientHeight;

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

    activeImg.activateImgView();
  }

  /**
   * Close full screen
   *
   * @returns {boolean} `true` if the full screen mode was closed successfully, otherwise `false`.
   */
  protected closePlayerImgEvent = (): boolean => {
    console.log('[D]closePlayerImg:', 'fullScreen=' + this.imgGlobalState.fullScreen, this.imgGlobalState.activeImg?.fullScreen);

    if (!this.imgGlobalState.fullScreen) {
      return false;
    }

    if (this.imageDomManager.imgPlayerEl) {
      // hide full screen
      this.imageDomManager.imgPlayerEl.style.display = 'none'; // hide 'img-player'
      this.imageDomManager.imgPlayerEl.removeEventListener('click', this.closePlayerImgEvent);
    }
    if (this.imageDomManager.imgPlayerImgViewEl) {
      // clear `src` and `alt` for <img class="img-fullscreen">
      this.imageDomManager.imgPlayerImgViewEl.src = '';
      this.imageDomManager.imgPlayerImgViewEl.alt = '';
    }

    this.imgGlobalState.fullScreen = false;
    if (this.imgGlobalState.activeImg) {
      this.imgGlobalState.activeImg.fullScreen = false;
      this.imgGlobalState.activeImg.activateImgView();
    }

    // this.imageDomManager.activateModeContainerEl();

    return true;

  }
  //#endregion #full screen#

  //#region ================== events ========================
  protected abstract addEvents(matchedImg: ImgCto): void;
  protected abstract removeEvents(matchedImg: ImgCto): void;

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

  /**
   * Move the image by keyboard
   *
   * @param event
   */
  protected triggerKeydownEvent = (event: KeyboardEvent) => {
    //console.info('[D]keydown:', event.key, this.imgGlobalState);
    if (this.imageHandler.isNoPopupImg()) {
      return;
    }
    if ('Escape' === event.key) {
      // close full screen, hide container view
      this.closeContainer(null, this.imgGlobalState.activeImg);
      return;
    }
    if (this.imgGlobalState.fullScreen) {
      return;
    }
    if (this.imgGlobalState.arrowUp && this.imgGlobalState.arrowLeft) {
      this.moveImgViewByHotkey(event, 'UP_LEFT');
      return;
    } else if (this.imgGlobalState.arrowUp && this.imgGlobalState.arrowRight) {
      this.moveImgViewByHotkey(event, 'UP_RIGHT');
      return;
    } else if (this.imgGlobalState.arrowDown && this.imgGlobalState.arrowLeft) {
      this.moveImgViewByHotkey(event, 'DOWN_LEFT');
      return;
    } else if (this.imgGlobalState.arrowDown && this.imgGlobalState.arrowRight) {
      this.moveImgViewByHotkey(event, 'DOWN_RIGHT');
      return;
    }
    switch (event.key) {
      case 'ArrowUp':
        this.imgGlobalState.arrowUp = true;
        this.moveImgViewByHotkey(event, 'UP');
        break;
      case 'ArrowDown':
        this.imgGlobalState.arrowDown = true;
        this.moveImgViewByHotkey(event, 'DOWN');
        break;
      case 'ArrowLeft':
        this.imgGlobalState.arrowLeft = true;
        this.moveImgViewByHotkey(event, 'LEFT');
        break;
      case 'ArrowRight':
        this.imgGlobalState.arrowRight = true;
        this.moveImgViewByHotkey(event, 'RIGHT');
        break;
      default:
        break
    }
  }

  protected triggerKeyupEvent = (event: KeyboardEvent) => {
    //console.log('[D]keyup:', event.key, this.viewMode);
    if (this.imgGlobalState.fullScreen || this.imageHandler.isNoPopupImg()) {
      return;
    }
    switch (event.key) {
      case 'ArrowUp':
        this.imgGlobalState.arrowUp = false;
        break;
      case 'ArrowDown':
        this.imgGlobalState.arrowDown = false;
        break;
      case 'ArrowLeft':
        this.imgGlobalState.arrowLeft = false;
        // switch to the previous image on the gallery navBar
        this.switchImageOnGalleryNavBar(event, false);
        break;
      case 'ArrowRight':
        this.imgGlobalState.arrowRight = false;
        // switch to the next image on the gallery navBar
        this.switchImageOnGalleryNavBar(event, true);
        break;
      default:
        break
    }
  }

  protected moveImgViewByHotkey(event: KeyboardEvent, orientation: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'UP_LEFT' | 'UP_RIGHT' | 'DOWN_LEFT' | 'DOWN_RIGHT') {
    if (!orientation || this.imageHandler.isNoPopupImg()
      || !this.checkHotkeySettings(event, this.plugin.settings.moveTheImageHotkey)) {
      return;
    }
    switch (orientation) {
      case 'UP':
        this.mousemoveImgViewEvent(null, { offsetX: 0, offsetY: -this.plugin.settings.imageMoveSpeed });
        break;
      case 'DOWN':
        this.mousemoveImgViewEvent(null, { offsetX: 0, offsetY: this.plugin.settings.imageMoveSpeed });
        break;
      case 'LEFT':
        this.mousemoveImgViewEvent(null, { offsetX: -this.plugin.settings.imageMoveSpeed, offsetY: 0 });
        break;
      case 'RIGHT':
        this.mousemoveImgViewEvent(null, { offsetX: this.plugin.settings.imageMoveSpeed, offsetY: 0 });
        break;
      case 'UP_LEFT':
        this.mousemoveImgViewEvent(null, {
          offsetX: -this.plugin.settings.imageMoveSpeed,
          offsetY: -this.plugin.settings.imageMoveSpeed
        });
        break;
      case 'UP_RIGHT':
        this.mousemoveImgViewEvent(null, {
          offsetX: this.plugin.settings.imageMoveSpeed,
          offsetY: -this.plugin.settings.imageMoveSpeed
        });
        break;
      case 'DOWN_LEFT':
        this.mousemoveImgViewEvent(null, {
          offsetX: -this.plugin.settings.imageMoveSpeed,
          offsetY: this.plugin.settings.imageMoveSpeed
        });
        break;
      case 'DOWN_RIGHT':
        this.mousemoveImgViewEvent(null, {
          offsetX: this.plugin.settings.imageMoveSpeed,
          offsetY: this.plugin.settings.imageMoveSpeed
        });
        break;
      default:
        break;
    }
  }

  protected mouseenterImgViewEvent = (event: MouseEvent) => {
    console.log('[D]mouseenterImgView:', 'dragging=' + this.imgGlobalState.dragging);
    this.resetClickTimer();
    // this.getAndUpdateActiveImg(event);
  }

  protected mousedownImgViewEvent = (event: MouseEvent) => {
    console.log('[D]mousedownImgView:', event.button);
    event.preventDefault();
    // event.stopPropagation();

    const activeImg = this.getAndUpdateActiveImg(event);
    if (!activeImg) {
      console.log('[D]mousedownImgView:', 'No activeImg');
      return;
    }
    activeImg.activateImgView();
    if (0 === event.button) { // left click
      this.setClickTimer(activeImg);
      this.setActiveImgZIndex(activeImg);
      this.imgGlobalState.dragging = true;

      activeImg.lastImgX = event.clientX;
      activeImg.lastImgY = event.clientY;

      activeImg.imgViewEl.addClass('dragging');

      this.imageDomManager.ownerDoc.addEventListener('mousemove', this.mousemoveImgViewEvent);
    }
    this.imageDomManager.ownerDoc.addEventListener('mouseup', this.mouseupImgViewEvent);
  }

  /**
   * move the image by mouse or keyboard
   * @param event
   * @param offsetSize
   */
  protected mousemoveImgViewEvent = (event: MouseEvent | null, offsetSize?: OffsetSizeIto) => {
    console.log('[D]mousemoveImgView:', 'clientX=' + event?.clientX, 'clientY=' + event?.clientY);
    const activeImg = this.imgGlobalState.activeImg;
    if (!activeImg) {
      console.warn('[oit] mousemoveImgView: found no activeImg!');
      return;
    }
    if (event) {
      if (!this.imgGlobalState.dragging) {
        console.warn('[oit] mousemoveImgView: no dragging!');
        return;
      }
      // drag via mouse cursor (Both Mode)
      activeImg.imgX = (event.clientX - activeImg.lastImgX) + activeImg.imgX;
      activeImg.imgY = (event.clientY - activeImg.lastImgY) + activeImg.imgY;

      activeImg.lastImgX = event.clientX;
      activeImg.lastImgY = event.clientY;

      //console.log('[D]mousemoveImgView Move:', 'clientX=' + event.clientX, 'clientY=' + event.clientY, 'left=' + activeImg.imgX, 'top=' + activeImg.imgY);
    } else if (offsetSize) {
      // move by arrow keys (Normal Mode)
      activeImg.imgX += offsetSize.offsetX;
      activeImg.imgY += offsetSize.offsetY;
    } else {
      return;
    }
    // const maxTop = - activeImg.curHeight + 30; // move to top
    // const minTop = window.innerHeight - 30; // move to bottom
    // const maxLeft = - activeImg.curWidth + 30; // move to left
    // const minLeft = window.innerWidth - 30; // move to right

    // activeImg.imgX = Math.max(maxLeft, Math.min(minLeft, activeImg.imgX));
    // activeImg.imgY = Math.max(maxTop, Math.min(minTop, activeImg.imgY));

    //console.log('[D]margin-left*top=' + activeImg.left + '*' + activeImg.top, 'image-width*height=' + activeImg.curWidth + '*' + activeImg.curHeight, 'window-inner-width*height=' + window.innerWidth + '*' + window.innerHeight);

    // move the image
    // activeImg.imgViewEl.style.setProperty('margin-left', activeImg.left + 'px', 'important');
    // activeImg.imgViewEl.style.setProperty('margin-top', activeImg.top + 'px', 'important');
    activeImg.imgViewEl.style.transform = `translate(${activeImg.imgX}px, ${activeImg.imgY}px)`;
  }

  protected mouseupImgViewEvent = (event: MouseEvent) => {
    console.log('[D]mouseupImgView:', event.button);
    event.preventDefault();
    event.stopPropagation();

    this.imgGlobalState.dragging = false;
    this.imageDomManager.ownerDoc.removeEventListener('mousemove', this.mousemoveImgViewEvent);
    this.imageDomManager.ownerDoc.removeEventListener('mouseup', this.mouseupImgViewEvent);

    const activeImg = this.imgGlobalState.activeImg;
    if (activeImg) {
      // console.log('ownerDoc.removeEventListener: mouseup, mousemove');

      activeImg.imgViewEl.removeClass('dragging');

      const targetEl = (<HTMLImageElement>event.target);
      if (2 == event.button && targetEl?.hasClass(OIT_CLASS.IMG_VIEW)) { // right click
        this.menuView.show(event, activeImg);
      }
    }
  }

  protected mouseleaveImgViewEvent = (event: MouseEvent) => {
    console.log('[D]mouseleaveImgView', 'dragging=' + this.imgGlobalState.dragging, '>>> set null', 'event.clientX*Y=' + event.clientX + '*' + event.clientY, 'window-inner-width*height=' + window.innerWidth + '*' + window.innerHeight);

    if (this.imgGlobalState.dragging &&
      // isInsideObsidian
      event.clientX >= 0 && event.clientX <= window.innerWidth &&
      event.clientY >= 0 && event.clientY <= window.innerHeight) {
      return;
    }

    this.imgGlobalState.dragging = false;
    this.imageDomManager.ownerDoc.removeEventListener('mousemove', this.mousemoveImgViewEvent);
    this.imageDomManager.ownerDoc.removeEventListener('mouseup', this.mouseupImgViewEvent);

    this.resetClickTimer();
    /* if (this.imgGlobalState.activeImg) {
      this.setGlobalActiveImg(null); // for pin mode
    } */
  }

  public setClickTimer = (activeImg?: ImgCto | null) => {
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

  public resetClickTimer() {
    this.imgGlobalState.clickTimer = null;
    this.imgGlobalState.clickCount = 0;
  }

  public getAndUpdateActiveImg = (event: MouseEvent | KeyboardEvent): ImgCto | null => {
    const targetEl = (<HTMLImageElement>event.target);
    let index: string | undefined;
    if (!targetEl?.hasClass(OIT_CLASS.IMG_VIEW) || !(index = targetEl.dataset.index)) {
      return null;
    }
    const activeImg: ImgCto = this.imageHandler.activeImages[parseInt(index)];
    if (activeImg && (!this.imgGlobalState.activeImg || activeImg.index !== this.imgGlobalState.activeImg.index)) {
      this.setGlobalActiveImg(activeImg); // update activeImg
    }
    // console.log('getAndUpdateActiveImg: ', activeImg)
    return activeImg;
  }

  protected mousewheelImgViewEvent = (event: WheelEvent) => {
    console.log('[D]mousewheelImgView', event.deltaMode, event.deltaX, event.deltaY, event.deltaZ);
    event.preventDefault();
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


    zoomData.setWidthImgView();
    zoomData.transformImgView();
    /* activeImgViewEl.setAttribute('width', zoomData.curWidth + 'px');
    activeImgViewEl.style.setProperty('margin-top', zoomData.top + 'px', 'important');
    activeImgViewEl.style.setProperty('margin-left', zoomData.left + 'px', 'important'); */
  }

  /**
   * Use toolbar:
   * 1. Normal Mode - click toolbar event: [event]
   * 2. Double Click Event - use default tool configured in settings: [null, toolbarItemClass, activeImg]
   * 3. Right-click Menu - click event: [null, toolbarItemClass, activeImg]
   * @param event
   * @param toolbarItemClass
   * @param activeImg
   * @returns
   */
  public clickToolbar = (event: MouseEvent | null, toolbarItemClass?: string, activeImg?: ImgCto | null) => {
    if (!toolbarItemClass) {
      if (!event) {
        return;
      }
      toolbarItemClass = (<HTMLElement>event.target).className;
    }
    if (!activeImg) {
      activeImg = this.imgGlobalState.activeImg;
    }
    if (!toolbarItemClass || !activeImg) {
      return;
    }
    switch (toolbarItemClass) {
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
        this.imageHandler.refreshImg(activeImg);
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
        this.closeContainer(null, activeImg);
        break
      default:
        break;
    }
  }
  //#endregion

}
