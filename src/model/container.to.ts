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

  // being dragged
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
  modeContainerEl: HTMLDivElement; // 'oit-normal', 'oit-pin': init during constructor of ContainerViewNew

  imgContainerEl: HTMLDivElement; // 'oit-img-container': including <img class='oit-img-view' src='' alt=''>

  imgTitleEl: HTMLDivElement; // 'oit-img-title'
  imgTitleNameEl: HTMLSpanElement; // 'oit-img-title-name'
  imgTitleIndexEl: HTMLSpanElement; // 'oit-img-title-index'

  imgTipEl: HTMLDivElement; // 'oit-img-tip': show the zoom ratio
  imgTipTimeout?: NodeJS.Timeout | null; // timer: control the display time of 'oit-img-tip'

  imgFooterEl: HTMLElement; // 'oit-img-footer': including 'oit-img-title', 'oit-img-toolbar', 'gallery-navbar'
  imgPlayerEl: HTMLDivElement; // 'img-player': including <img class="img-fullscreen" src='' alt=''>
  imgPlayerImgViewEl: HTMLImageElement; // 'img-fullscreen'

  constructor(oitContainerEl: HTMLDivElement) {
    this.modeContainerEl = oitContainerEl;
  }

  /* imgList: Array<ImgCto> = new Array<ImgCto>();
  public getPopupImgNum = (): number => {
    let num: number = 0;
    for (const imgCto of this.imgList) {
      if (imgCto.popup) num++;
    }
    return num;
  } */
}

export class ImgCto {
  index: number;
  mtime: number; // modified time
  popup: boolean = false; // currently whether it's popped-up

  //targetOriginalImgEl: HTMLImageElement;

  imgViewEl: HTMLImageElement; // 'oit-img-view'
  refreshImgInterval: NodeJS.Timeout | null;
  zIndex: number = 0;

  curWidth: number = 0; // image's current width
  curHeight: number = 0;
  realWidth: number = 0; // image's real width
  realHeight: number = 0;
  left: number = 0; // margin-left
  top: number = 0; // margin-top
  moveX: number = 0; // 鼠标相对于图片的位置
  moveY: number = 0;

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

  constructor(index: number, mtime: number, imgViewEl: HTMLImageElement) {
    this.index = index;
    this.mtime = mtime;
    this.imgViewEl = imgViewEl;
  }

  public resetRefreshImgInterval() {
    if (this.refreshImgInterval) {
      clearInterval(this.refreshImgInterval);
      this.refreshImgInterval = null;
    }
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

