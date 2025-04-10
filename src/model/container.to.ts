/**
 * ts class object: image operating state
 */
export class ImgOprStateCto {
  // whether the image is being dragged
  dragging: boolean = false;

  // keyboard pressing status
  arrowUp: boolean = false;
  arrowDown: boolean = false;
  arrowLeft: boolean = false;
  arrowRight: boolean = false;

  fullScreen: boolean = false;

  // Currently being clicked/dragged
  activeImg: ImgCto | null;
  activeImgZIndex: number = 0; /*--layer-status-bar*/

  // Double click event:
  clickCount: number = 0;
  clickTimer: NodeJS.Timeout | null;
}

/**
 * ts interface object: image information
 */
/**
 * @deprecated
 */
export interface ImgInfoIto {
  // oitContainerViewEl: HTMLDivElement; // 'oit-normal-container-view', 'oit-pin-container-view'
  imgViewEl: HTMLImageElement;
  imgTitleEl: HTMLDivElement;
  imgTipEl: HTMLDivElement;
  imgTipTimeout?: NodeJS.Timeout;
  imgFooterEl: HTMLElement;
  imgPlayerEl: HTMLDivElement; // 'img-player'
  imgPlayerImgViewEl: HTMLImageElement; // 'img-fullscreen'

  curWidth: number;
  curHeight: number;
  realWidth: number;
  realHeight: number;
  left: number;
  top: number;
  moveX: number;
  moveY: number;
  rotate: number;

  invertColor: boolean;
  scaleX: boolean;
  scaleY: boolean;

  // whether the image is being previewed in full-screen mode
  fullScreen: boolean;
}

/**
 * ts class object: image content including important html elements
 */
export class ImageDomManager {
  //ownerDoc: Document;
  //modeContainerEl: HTMLDivElement; // 'oit-normal', 'oit-pin': init during constructor of ContainerViewNew

  imgHeaderEl: HTMLDivElement | null; // 'oit-img-header': only for Normal mode
  imgIndexEl: HTMLDivElement; // 'oit-img-index'
  imgTitleEl: HTMLDivElement; // 'oit-img-title'

  imgContainerEl: HTMLDivElement; // 'oit-img-container'
  imgViewFamilyEl: HTMLDivElement; // 'oit-img-view-family': including <img class='oit-img-view' src='' alt=''>

  imgTipEl: HTMLDivElement; // 'oit-img-tip': show the zoom ratio
  imgTipTimeout?: NodeJS.Timeout | null; // timer: control the display time of 'oit-img-tip'

  imgFooterEl: HTMLElement; // 'oit-img-footer': including 'oit-img-title', 'oit-img-toolbar', 'gallery-navbar'
  imgPlayerEl: HTMLDivElement; // 'img-player': including <img class="img-fullscreen" src='' alt=''>
  imgPlayerImgViewEl: HTMLImageElement; // 'img-fullscreen'

  constructor(readonly ownerDoc: Document, readonly modeContainerEl: HTMLDivElement) {
  }

  /* public activateModeContainerEl() {
    // The `tabIndex` defines whether an element can receive keyboard focus.
    // Setting `tabIndex = 0` allows the element to be focusable and included in the tab order of the page.
    this.modeContainerEl.tabIndex = 0;
    //  Move focus to `modeContainerEl` <div>
    this.modeContainerEl.focus();
  } */

  public displayModeContainerEl() {
    this.modeContainerEl.addClass('active');
  }

  public closeModeContainerEl() {
    this.modeContainerEl.removeClass('active');
  }

}

export class ImgCto {
  // index: number; // Confirm upon initialization and do not modify afterwards
  index: string; // Confirm upon initialization and do not modify afterwards
  mtime: number; // open time: will be reset while closed
  popup: boolean = false; // currently whether it's popped-up

  //targetOriginalImgEl: HTMLImageElement;

  imgViewEl: HTMLImageElement; // 'oit-img-view'
  alt: string;
  src: string;

  refreshImgInterval: NodeJS.Timeout | null;

  zIndex: number = 0;

  curWidth: number = 0; // image's current width
  curHeight: number = 0;
  realWidth: number = 0; // image's real width
  realHeight: number = 0;

  lastImgX: number = 0; // event.clientX
  lastImgY: number = 0; // event.clientY
  imgX: number = 0; // left: current x of the image for transformX
  imgY: number = 0; // top: current Y of the image for transformY

  rotate: number = 0; // rotateDeg
  invertColor: boolean = false;
  scaleX: boolean = false; // scaleX(-1)
  scaleY: boolean = false; // scaleY(-1)
  fullScreen: boolean = false; // whether the image is being previewed in full-screen mode

  defaultImgStyle = {
    transform: 'none',
    filter: 'none',
    mixBlendMode: 'normal',

    borderWidth: '',
    borderStyle: '',
    borderColor: ''
  }

  constructor(index: string, imgViewEl: HTMLImageElement) {
    this.index = index;
    this.imgViewEl = imgViewEl;
  }

  public resetRefreshImgInterval() {
    if (this.refreshImgInterval) {
      clearInterval(this.refreshImgInterval);
      this.refreshImgInterval = null;
    }
  }

  /**
   * Display `imgViewEl`
   *
   * @param imgViewEl
   * @param src
   * @param alt
   * @returns
   */
  public displayImgView() {
    const imgViewEl = this.imgViewEl;
    if (!imgViewEl) {
      return;
    }
    this.mtime = new Date().getTime();
    imgViewEl.src = this.src;
    imgViewEl.alt = this.alt;
    imgViewEl.hidden = false; // !img.src && !img.alt;
  }

  /**
  * Hide `imgViewEl`
  *
  * @param imgViewEl
  * @returns
  */
  public closeImgView() {
    const imgViewEl = this.imgViewEl;
    imgViewEl.src = '';
    imgViewEl.alt = '';
    imgViewEl.hidden = true;

    //this.mtime = 0;
    this.popup = false;
    this.refreshImgInterval = null;
    this.zIndex = 0;
    this.curWidth = 0;
    this.curHeight = 0;
    this.realWidth = 0;
    this.realHeight = 0;
    this.imgX = 0;
    this.imgY = 0;
    //this.imgStartX = 0;
    //this.imgStartY = 0;
    this.rotate = 0;
    this.invertColor = false;
    this.scaleX = false;
    this.scaleY = false;
    this.fullScreen = false;
  }

  public activateImgView() {
    //this.imgViewEl.tabIndex = 0;
    this.imgViewEl.focus();
    this.imgViewEl.addClass('active');
  }

  public deactivateImgView() {
    this.imgViewEl.removeClass('active');
  }

  public renderZIndex() {
    this.imgViewEl.style.zIndex = this.zIndex.toString();
  }

  public transformImgView() {
    this.imgViewEl.style.transform = `translate(${this.imgX}px, ${this.imgY}px) scale(${this.scaleX ? -1 : 1}, ${this.scaleY ? -1 : 1}) rotate(${this.rotate}deg)`;
  }

  public setWidthImgView() {
    this.imgViewEl.width = this.curWidth;
  }

}

export class LastClickedImgCto {

  // the clicked original image element
  private lastClickedImgEl: HTMLImageElement;

  private defaultStyle = {
    borderWidth: '',
    borderStyle: '',
    borderColor: ''
  }

  public getLastClickedImg(): HTMLImageElement {
    return this.lastClickedImgEl;
  }

  public setLastClickedImg(imgEl: HTMLImageElement) {
    // 'data-oit-target' is set for locating current image
    imgEl.setAttribute('data-oit-target', '1');
    this.lastClickedImgEl = imgEl;
  }

  /**
   * remove 'data-oit-target'
   * restore default border style
   */
  public restoreBorderForLastClickedImg() {
    if (!this.lastClickedImgEl) {
      return;
    }
    this.lastClickedImgEl.removeAttribute('data-oit-target');
    const lastClickedImgStyle = this.lastClickedImgEl.style;
    if (lastClickedImgStyle) {
      lastClickedImgStyle.setProperty('border-width', this.defaultStyle.borderWidth);
      lastClickedImgStyle.setProperty('border-style', this.defaultStyle.borderStyle);
      lastClickedImgStyle.setProperty('border-color', this.defaultStyle.borderColor);
    }
  }

  public setDefaultStyle(borderWidth: string, borderStyle: string, borderColor: string) {
    this.defaultStyle.borderWidth = borderWidth;
    this.defaultStyle.borderStyle = borderStyle;
    this.defaultStyle.borderColor = borderColor;
  }

}

