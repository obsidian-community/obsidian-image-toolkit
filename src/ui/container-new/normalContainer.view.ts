import ImageToolkitPlugin from "src/main";
import { ContainerViewNew } from "./container.view";
import { ImgCto } from "src/model/container.to";
import { OIT_CLASS, ViewModeEnum } from "src/conf/constants";
import { TOOLBAR_CONF } from "src/conf/toolbar.conf";
import { t } from "src/lang/helpers";
import { GalleryNavbarView } from "../galleryNavbarView";

export class NormalContainerNew extends ContainerViewNew {

  private galleryNavbarView: GalleryNavbarView | null;

  constructor(plugin: ImageToolkitPlugin, ownerDoc: Document, rootContainerEl: HTMLDivElement) {
    super(ViewModeEnum.Normal, plugin, ownerDoc,
      createDiv({ cls: OIT_CLASS.MODE_CONTAINER_NORMAL, parent: rootContainerEl }));
  }

  //@Override
  protected getMaxPopupImgCount(): number {
    return 1;
  }

  //@Override
  protected checkStatus(): boolean {
    // none of popped-up images
    return this.isNoPopupImg();
  }

  //@Override
  protected initContainerDom(bodyEl: Element): void {
    let modeContainerEl = this.imageDomManager.modeContainerEl;
    if (!modeContainerEl) {
      // 0. <div class="oit-normal"> ... <div>
      modeContainerEl = createDiv({ cls: OIT_CLASS.MODE_CONTAINER_NORMAL, parent: bodyEl });
      this.imageDomManager.modeContainerEl = modeContainerEl;
    }

    if (!this.imageDomManager.imgContainerEl) {
      // 1. <div class="oit-img-container">...</div>
      this.imageDomManager.imgContainerEl = createDiv({ cls: OIT_CLASS.IMG_CONTAINER, parent: modeContainerEl });
      // 1.1. <div class="oit-img-container"> `<img class="oit-img-view" src="" alt="">` </div>
      // create `oit-img-view` <img> element and set activeImages
      this.updateImgViewElAndList();
    }

    if (!this.imageDomManager.imgTipEl) {
      // 2. <div class="oit-img-tip"></div>
      this.imageDomManager.imgTipEl = createDiv({ cls: OIT_CLASS.IMG_TTP, parent: modeContainerEl },
        (el) => { el.hidden = true; });
    }

    if (!this.imageDomManager.imgFooterEl) {
      // 3. <div class="oit-img-footer">...<div>
      this.imageDomManager.imgFooterEl = createDiv({ cls: OIT_CLASS.IMG_FOOTER, parent: modeContainerEl });

      // 3.1. <div class="oit-img-title"></div>
      this.imageDomManager.imgTitleEl = createDiv({ cls: OIT_CLASS.IMG_TITLE, parent: this.imageDomManager.imgFooterEl });
      // <span class="oit-img-title-name"></span>
      this.imageDomManager.imgTitleNameEl = createSpan({ cls: OIT_CLASS.IMG_TITLE_NAME, parent: this.imageDomManager.imgTitleEl });
      // <span class="oit-img-title-index"></span>
      this.imageDomManager.imgTitleIndexEl = createSpan({ cls: OIT_CLASS.IMG_TITLE_INDEX, parent: this.imageDomManager.imgTitleEl });

      // 3.2. <ul class="oit-img-toolbar">
      const imgToolbarUlEL = createEl('ul', { cls: OIT_CLASS.IMG_TOOLBAR, parent: this.imageDomManager.imgFooterEl });
      for (const toolbar of TOOLBAR_CONF) {
        if (!toolbar.enableToolbarIcon) continue;
        // @ts-ignore
        const toolbarTitle = t(toolbar.title);
        createEl('li', { cls: toolbar.class, attr: { alt: toolbar.title, title: toolbarTitle }, parent: imgToolbarUlEL });
      }
      // add event: for oit-img-toolbar ul
      imgToolbarUlEL.addEventListener('click', this.clickToolbar);

      if (!this.imageDomManager.imgPlayerEl) {
        // 4. <div class="img-player"> <img class='img-fullscreen' src=''> </div>
        this.imageDomManager.imgPlayerEl = createDiv({ cls: OIT_CLASS.IMG_PLAYER, parent: modeContainerEl }); // img-player for full screen mode
        this.imageDomManager.imgPlayerImgViewEl = createEl('img', { cls: OIT_CLASS.IMG_FULLSCREEN, parent: this.imageDomManager.imgPlayerEl });
      }
    }
  }

  //@Override
  protected getMatchedImg(): ImgCto {
    if (0 === this.activeImages.length) {
      this.updateImgViewElAndList();
    }
    return this.activeImages[0];
  }

  protected openContainer(matchedImg: ImgCto): void {
    if (!this.imageDomManager.modeContainerEl) {
      return;
    }
    matchedImg.popup = true;
    // display 'oit-normal'
    this.imageDomManager.modeContainerEl.style.display = 'block';
  }

  /**
   * Close container view:
   * 1. Normal - click event 'oit-normal': Click on other masked areas to close. [event]
   * 2. Normal - Press 'Escape' keydown event: [event]
   * 3. Pin - Click 'toolbar_close' in right menu: [event, activeImg]
   * @param event
   * @param activeImg
   * @returns
   */
  public closeContainer = (event?: MouseEvent, activeImg?: ImgCto | null): void => {
    if (event) {
      const target = <HTMLElement>event.target;
      if (!target || !(target.hasClass(OIT_CLASS.MODE_CONTAINER_NORMAL) || target.hasClass(OIT_CLASS.IMG_CONTAINER))) {
        return;
      }
    }
    if (!activeImg && !(activeImg = this.imgGlobalState.activeImg)) {
      return;
    }
    if (this.imageDomManager.modeContainerEl) {
      this.imageDomManager.modeContainerEl.style.display = 'none'; // hide 'oit-normal'
      this.renderImgTitle('', '');
      this.renderImgView(activeImg.imgViewEl, '', '');
      this.removeEvents(activeImg);
      activeImg.popup = false;
      activeImg.mtime = 0;
    }
    if (this.plugin.settings.galleryNavbarToggle && this.galleryNavbarView) {
      this.galleryNavbarView.closeGalleryNavbar();
    }
  }

  protected renderImgTitle = (name?: string, index?: string): void => {
    if (undefined !== name && null !== name) {
      this.imageDomManager.imgTitleNameEl.setText(name);
    }
    if (undefined !== index && null !== index) {
      this.imageDomManager.imgTitleIndexEl.setText(' ' + index);
    }
  }

  protected afterRefreshImg(): void {
    this.imageDomManager.modeContainerEl.tabIndex = 0;
    this.imageDomManager.modeContainerEl.focus();
  }

  protected addEvents(matchedImg: ImgCto): void {
    this.imageDomManager.modeContainerEl.addEventListener('click', this.closeContainer);
    this.imageDomManager.modeContainerEl.addEventListener('keydown', this.triggerKeydown);
    this.imageDomManager.modeContainerEl.addEventListener('keyup', this.triggerKeyup);

    matchedImg.imgViewEl.addEventListener('mouseenter', this.mouseenterImgView);
    matchedImg.imgViewEl.addEventListener('mouseleave', this.mouseleaveImgView);
    // drag the image via mouse
    matchedImg.imgViewEl.addEventListener('mousedown', this.mousedownImgView);
    // zoom the image via mouse wheel
    matchedImg.imgViewEl.addEventListener('mousewheel', this.mousewheelImgView, { passive: true });
  }

  protected removeEvents(matchedImg: ImgCto): void {
    this.imageDomManager.modeContainerEl.removeEventListener('click', this.closeContainer);
    this.imageDomManager.modeContainerEl.removeEventListener('keydown', this.triggerKeydown);
    this.imageDomManager.modeContainerEl.removeEventListener('keyup', this.triggerKeyup);

    matchedImg.imgViewEl.removeEventListener('mouseenter', this.mouseenterImgView);
    matchedImg.imgViewEl.removeEventListener('mouseleave', this.mouseleaveImgView);
    // drag the image via mouse
    matchedImg.imgViewEl.removeEventListener('mousedown', this.mousedownImgView);
    // zoom the image via mouse wheel
    matchedImg.imgViewEl.removeEventListener('mousewheel', this.mousewheelImgView);
  }

  /**
   * move the image by keyboard
   * @param event
   */
  protected triggerKeydown = (event: KeyboardEvent) => {
    // console.info('keydown:', event.key, this.viewMode, this.imgGlobalStatus);
    if (this.isNoPopupImg()) {
      return;
    }
    if ('Escape' === event.key) {
      // close full screen, hide container view
      this.imgGlobalState.fullScreen ? this.closePlayerImg() : this.closeContainer();
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

  protected triggerKeyup = (event: KeyboardEvent) => {
    // console.log('keyup:', event.key, this.viewMode, this.imgGlobalStatus);
    if (this.imgGlobalState.fullScreen || this.isNoPopupImg()) {
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
    if (!orientation || this.isNoPopupImg()
      || !this.checkHotkeySettings(event, this.plugin.settings.moveTheImageHotkey)) {
      return;
    }
    switch (orientation) {
      case 'UP':
        this.mousemoveImgView(null, { offsetX: 0, offsetY: -this.plugin.settings.imageMoveSpeed });
        break;
      case 'DOWN':
        this.mousemoveImgView(null, { offsetX: 0, offsetY: this.plugin.settings.imageMoveSpeed });
        break;
      case 'LEFT':
        this.mousemoveImgView(null, { offsetX: -this.plugin.settings.imageMoveSpeed, offsetY: 0 });
        break;
      case 'RIGHT':
        this.mousemoveImgView(null, { offsetX: this.plugin.settings.imageMoveSpeed, offsetY: 0 });
        break;
      case 'UP_LEFT':
        this.mousemoveImgView(null, {
          offsetX: -this.plugin.settings.imageMoveSpeed,
          offsetY: -this.plugin.settings.imageMoveSpeed
        });
        break;
      case 'UP_RIGHT':
        this.mousemoveImgView(null, {
          offsetX: this.plugin.settings.imageMoveSpeed,
          offsetY: -this.plugin.settings.imageMoveSpeed
        });
        break;
      case 'DOWN_LEFT':
        this.mousemoveImgView(null, {
          offsetX: -this.plugin.settings.imageMoveSpeed,
          offsetY: this.plugin.settings.imageMoveSpeed
        });
        break;
      case 'DOWN_RIGHT':
        this.mousemoveImgView(null, {
          offsetX: this.plugin.settings.imageMoveSpeed,
          offsetY: this.plugin.settings.imageMoveSpeed
        });
        break;
      default:
        break;
    }
  }

  //#region ================== Gallery Navbar ========================
  protected renderGalleryNavbar() {
    // <div class="gallery-navbar"> <ul class="gallery-list"> <li> <img src='' alt=''> </li> <li...> <ul> </div>
    if (!this.plugin.settings.galleryNavbarToggle) {
      return;
    }
    if (!this.galleryNavbarView) {
      this.galleryNavbarView = new GalleryNavbarView(this, this.plugin);
    }
    this.galleryNavbarView.renderGalleryImg(this.imageDomManager.imgFooterEl);
  }

  protected removeGalleryNavbar() {
    if (!this.galleryNavbarView) {
      return;
    }
    this.galleryNavbarView.remove();
    this.galleryNavbarView = null;
  }

  protected switchImageOnGalleryNavBar = (event: KeyboardEvent, next: boolean) => {
    if (!this.checkHotkeySettings(event, this.plugin.settings.switchTheImageHotkey))
      return;
    this.galleryNavbarView?.switchImage(next);
  }
  //endregion ==Gallery Navbar==

}
