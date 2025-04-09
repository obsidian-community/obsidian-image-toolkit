import ImageToolkitPlugin from "src/main";
import { ContainerViewNew } from "./container.view";
import { ImgCto } from "src/model/container.to";
import { OIT_CLASS, ViewModeEnum } from "src/conf/constants";
import { TOOLBAR_CONF } from "src/conf/toolbar.conf";
import { t } from "src/lang/helpers";
import { GalleryNavbarView } from "../galleryNavbarView";
import { setIcon } from "obsidian";

export class NormalContainerNew extends ContainerViewNew {

  private galleryNavbarView: GalleryNavbarView | null;

  private mousedownClassName: string;

  constructor(plugin: ImageToolkitPlugin, ownerDoc: Document, rootContainerEl: HTMLDivElement) {
    super(ViewModeEnum.Normal, plugin, ownerDoc,
      createDiv({ cls: OIT_CLASS.MODE_CONTAINER_NORMAL, parent: rootContainerEl }));
  }

  //@Override
  protected getMaxPopupImgCount(): number {
    return 1;
  }

  //@Override
  protected checkImageCanPopup(): boolean {
    // In Normal mode, only one image can be popped up at a time。
    return this.imageHandler.isNoPopupImg();
  }

  //@Override
  protected initContainerDom(): void {
    // oit-normal
    const modeContainerEl = this.imageDomManager.modeContainerEl;
    if (!this.imageDomManager.imgHeaderEl) {
      // 1. oit-img-header:
      this.imageDomManager.imgHeaderEl = createDiv({ cls: OIT_CLASS.IMG_HEADER, parent: modeContainerEl });
      // 1.1. oit-image-info:
      const imgInfoEl = createDiv({ cls: OIT_CLASS.IMG_INFO, parent: this.imageDomManager.imgHeaderEl });
      // 1.1.1. oit-img-index:
      this.imageDomManager.imgIndexEl = createDiv({ cls: OIT_CLASS.IMG_INDEX, parent: imgInfoEl/* , text: '2/15' */ });
      // 1.1.2. oit-img-title:
      this.imageDomManager.imgTitleEl = createDiv({ cls: OIT_CLASS.IMG_TITLE, parent: imgInfoEl/* , text: 'Bird.png' */ });
      // 1.2. oit-normal-close:
      const normalCloseEl = createDiv({ cls: OIT_CLASS.NORMAL_CLOSE, parent: this.imageDomManager.imgHeaderEl });
      normalCloseEl.addEventListener('click', (event: MouseEvent) => {
        this.closeContainer(null, this.imgGlobalState.activeImg);
      });
    }

    if (!this.imageDomManager.imgContainerEl) {
      // 2. oit-img-container:
      this.imageDomManager.imgContainerEl = createDiv({ cls: OIT_CLASS.IMG_CONTAINER, parent: modeContainerEl });
      // 2.1. oit-prev-button:
      const prevBtn = createDiv({ cls: ['oit-nav-button', 'oit-prev-button'], parent: this.imageDomManager.imgContainerEl });
      prevBtn.addEventListener('click', (event: MouseEvent) => {
        //this.imgGlobalState.activeImg?.prevImgView();
      });
      // 2.2. <div class="oit-img-container"> `<img class="oit-img-view" src="" alt="">` </div>
      // create `oit-img-view` <img> element and set activeImages
      this.updateImgViewElAndList();
      // 2.3. oit-next-button:
      const nextBtn = createDiv({ cls: ['oit-nav-button', 'oit-next-button'], parent: this.imageDomManager.imgContainerEl });
      nextBtn.addEventListener('click', (event: MouseEvent) => {
        //this.imgGlobalState.activeImg?.prevImgView();
      });
    }

    if (!this.imageDomManager.imgTipEl) {
      // 3. oit-img-tip:
      this.imageDomManager.imgTipEl = createDiv({ cls: OIT_CLASS.IMG_TTP, parent: modeContainerEl },
        (el) => { el.hidden = true; });
    }

    if (!this.imageDomManager.imgFooterEl) {
      // 4. oit-img-footer:
      this.imageDomManager.imgFooterEl = createDiv({ cls: OIT_CLASS.IMG_FOOTER, parent: modeContainerEl });

      // 4.1. oit-img-toolbar:
      const imgToolbarUlEL = createEl('ul', { cls: OIT_CLASS.IMG_TOOLBAR, parent: this.imageDomManager.imgFooterEl });
      for (const toolbar of TOOLBAR_CONF) {
        if (!toolbar.enableToolbarIcon) {
          continue;
        }
        // @ts-ignore
        const toolbarTitle = t(toolbar.title);
        const toolLiEl = createEl('li', { cls: ['oit-tool', toolbar.class], parent: imgToolbarUlEL, attr: { alt: toolbar.title, title: toolbarTitle } });
        setIcon(toolLiEl, toolbar.icon);
        toolLiEl.addEventListener('click', (event: MouseEvent) => {
          this.clickToolbar(null, toolbar.class, this.imgGlobalState.activeImg);
        });
      }

      // 4.2. oit-gallery-navbar:
      const galleryNavbarEl = createDiv({ cls: 'oit-gallery-navbar', parent: this.imageDomManager.imgFooterEl });
      const galleryToggleEl = createDiv({ cls: 'oit-gallery-toggle', parent: galleryNavbarEl });
      galleryToggleEl.addEventListener('click', (event: MouseEvent) => {
        galleryNavbarEl.classList.toggle('collapsed');
      });
      const galleryListContainerEl = createDiv({ cls: 'oit-gallery-list-container', parent: galleryNavbarEl });
      const galleryListUlEl = createEl('ul', { cls: 'oit-gallery-list', parent: galleryListContainerEl });
      createEl('img', { cls: 'oit-gallery-img', attr: { src: 'http://uigarage.net/wp-content/uploads/2023/08/onboarding_.mov_P0BAQa7.mp4975e.jpg' }, parent: createEl('li', { parent: galleryListUlEl }) });
      createEl('img', { cls: 'oit-gallery-img', attr: { src: 'https://s2.loli.net/2024/10/06/PGyNHh54zWQJlni.png' }, parent: createEl('li', { parent: galleryListUlEl }) });
      createEl('img', { cls: 'oit-gallery-img', attr: { src: 'https://s2.loli.net/2024/10/06/PGyNHh54zWQJlni.png' }, parent: createEl('li', { parent: galleryListUlEl }) });
      createEl('img', { cls: 'oit-gallery-img', attr: { src: 'https://s2.loli.net/2024/10/06/PGyNHh54zWQJlni.png' }, parent: createEl('li', { parent: galleryListUlEl }) });
      createEl('img', { cls: 'oit-gallery-img', attr: { src: 'https://s2.loli.net/2024/10/06/PGyNHh54zWQJlni.png' }, parent: createEl('li', { parent: galleryListUlEl }) });
    }

    if (!this.imageDomManager.imgPlayerEl) {
      // 5. oit-img-player:
      this.imageDomManager.imgPlayerEl = createDiv({ cls: OIT_CLASS.IMG_PLAYER, parent: modeContainerEl });
      // 5.1. oit-img-fullscreen:
      this.imageDomManager.imgPlayerImgViewEl = createEl('img', { cls: OIT_CLASS.IMG_FULLSCREEN, parent: this.imageDomManager.imgPlayerEl });
    }
  }

  //@Override
  protected getMatchedImg(): ImgCto {
    if (0 === this.imageHandler.activeImages.length) {
      this.updateImgViewElAndList();
    }
    return this.imageHandler.activeImages[0];
  }

  //@Override
  protected openContainer(matchedImg: ImgCto): void {
    matchedImg.popup = true;
    // display 'oit-normal'
    this.imageDomManager.displayModeContainerEl();
  }

  /**
   * Close container view:
   * 1. Normal - click event 'oit-normal': Click onto other masked areas to close. [event, activeImg] -> from closeContainerEvent
   * 2. Normal - Press 'Escape' keydown event: [null, activeImg] -> from triggerKeydown
   * 3. Normal - Click 'toolbar_close' in right-click menu: [null, activeImg]
   * @param event
   * @param activeImg
   * @returns
   */
  //@Override
  public closeContainer(event: MouseEvent | null, activeImg: ImgCto | null): void {
    console.log('[D]closeContainer-normal:', event, activeImg, this.imgGlobalState);
    if (event) {
      // 1. Normal - click event 'oit-normal'
      const target = <HTMLElement>event.target;
      console.log('[D]closeContainer-normal-target:', "'" + target?.classList.value + "'");
      if (!target || !(target.hasClass(OIT_CLASS.MODE_CONTAINER_NORMAL) || target.hasClass(OIT_CLASS.IMG_CONTAINER))) {
        return;
      }
    }
    if (this.closePlayerImgEvent() || !activeImg) {
      return;
    }
    if (this.imageDomManager.modeContainerEl) {
      this.imgGlobalState.activeImg = null;
      activeImg.closeImgView();
      this.imageDomManager.closeModeContainerEl(); // hide 'oit-normal'
      this.renderImgInfo('', '');
      this.removeEvents(activeImg);
    }
    if (this.plugin.settings.galleryNavbarToggle && this.galleryNavbarView) {
      this.galleryNavbarView.closeGalleryNavbar();
    }
  }

  //@Override
  protected renderImgInfo = (name?: string, index?: string): void => {
    if (undefined !== name && null !== name) {
      this.imageDomManager.imgTitleEl.setText(name);
    }
    if (undefined !== index && null !== index) {
      this.imageDomManager.imgIndexEl.setText(' ' + index);
    }
  }

  //@Override
  protected addEvents(matchedImg: ImgCto): void {
    // this.imageDomManager.modeContainerEl.addEventListener('click', this.closeContainerEvent);
    this.imageDomManager.modeContainerEl.addEventListener('mousedown', (event: MouseEvent) => {
      console.log('[D]==>mousedown:', (<HTMLElement>event.target));
      const targetEl = (<HTMLElement>event.target);
      this.mousedownClassName = targetEl?.className;

    });
    this.imageDomManager.modeContainerEl.addEventListener('mouseup', (event: MouseEvent) => {
      console.log('[D]==>mouseup:', (<HTMLElement>event.target).className, 'mousedownClassName=' + this.mousedownClassName);
      const targetEl = (<HTMLElement>event.target);
      if (!this.mousedownClassName || this.mousedownClassName !== targetEl?.className) {
        console.log('[D]==>mouseup: return!');
        return;
      }
      const activeImg = this.imgGlobalState.activeImg;
      if (activeImg) {
        this.closeContainer(event, activeImg);
      }
    });


    this.imageDomManager.modeContainerEl.addEventListener('keydown', this.triggerKeydownEvent);
    this.imageDomManager.modeContainerEl.addEventListener('keyup', this.triggerKeyupEvent);

    matchedImg.imgViewEl.addEventListener('mouseenter', this.mouseenterImgViewEvent);
    matchedImg.imgViewEl.addEventListener('mouseleave', this.mouseleaveImgViewEvent);
    // drag the image via mouse
    matchedImg.imgViewEl.addEventListener('mousedown', this.mousedownImgViewEvent);
    // zoom the image via mouse wheel
    matchedImg.imgViewEl.addEventListener('mousewheel', this.mousewheelImgViewEvent, { passive: true });
  }

  //@Override
  protected removeEvents(matchedImg: ImgCto): void {
    this.imageDomManager.modeContainerEl.removeEventListener('click', this.closeContainerEvent);
    this.imageDomManager.modeContainerEl.removeEventListener('keydown', this.triggerKeydownEvent);
    this.imageDomManager.modeContainerEl.removeEventListener('keyup', this.triggerKeyupEvent);

    matchedImg.imgViewEl.removeEventListener('mouseenter', this.mouseenterImgViewEvent);
    matchedImg.imgViewEl.removeEventListener('mouseleave', this.mouseleaveImgViewEvent);
    // drag the image via mouse
    matchedImg.imgViewEl.removeEventListener('mousedown', this.mousedownImgViewEvent);
    // zoom the image via mouse wheel
    matchedImg.imgViewEl.removeEventListener('mousewheel', this.mousewheelImgViewEvent);
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
