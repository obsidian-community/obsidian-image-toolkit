import { ViewModeEnum, ZOOM_FACTOR } from "src/conf/constants";
import { ImageDomManager, ImgCto } from "src/model/container.to";
import { ImageUtil } from "src/util/image.util";

export abstract class ImageHandlerFactory {

  public static createImageHandler(viewMode: ViewModeEnum, imageDomManager: ImageDomManager): ImageHandler {
    switch (viewMode) {
      case ViewModeEnum.Normal:
        return new NormalImageHandler(imageDomManager);
      case ViewModeEnum.Pin:
        return new PinImageHandler(imageDomManager);
      default:
        throw new Error(`Unsupported view mode: ${viewMode}`);
    }
  }

}

export abstract class ImageHandler {

  public readonly activeImages: Array<ImgCto> = new Array<ImgCto>();

  // key: index ('oit-img-view': data-index), value: ImgCto
  public readonly activeImageMap: Map<string, ImgCto> = new Map<string, ImgCto>();

  public constructor(protected readonly imageDomManager: ImageDomManager) {
  }

  //#region ↓↓↓↓↓ activeImages ↓↓↓↓↓
  public getPopupImgNum(): number {
    return this.activeImages.filter(img => img.popup).length;
  }

  public isAnyPopupImg(): boolean {
    return this.activeImages.some(img => img.popup);
  }

  public isNoPopupImg(): boolean {
    return this.activeImages.every(img => !img.popup);
  }
  //#endregion ↑↑↑↑↑↑ activeImages ↑↑↑↑↑

  /**
     * it may from:
     * 1. displayImage()
     * 2. toolbar_refresh
     * 3. switch GalleryNavbarView
     *
     * @param img
     * @param imgSrc
     * @param imgAlt
     * @param imgTitleIndex e.g. <span class="oit-img-title-index">[3/6]</span>
     */
  public refreshImg(img: ImgCto) {
    if (!img) {
      return;
    }
    this.renderImgInfo(img.alt, img.index.toString());

    if (!img.src) {
      return
    }

    img.resetRefreshImgInterval();
    const realImg = new Image();
    realImg.src = img.src;
    img.refreshImgInterval = setInterval((realImg) => {
      if (realImg.width > 0 || realImg.height > 0) {
        img.resetRefreshImgInterval();

        this.calculateImgZoomSize(realImg, img);
        this.renderImgView(img);
        //this.renderImgTip(img);

        //img.imgViewEl.style.transform = img.defaultImgStyle.transform;
        img.imgViewEl.style.filter = img.defaultImgStyle.filter;
        img.imgViewEl.style.mixBlendMode = img.defaultImgStyle.mixBlendMode;

        this.afterRefreshImg(img);
      }
    }, 40, realImg);
  }

  protected abstract afterRefreshImg(img: ImgCto): void;

  protected renderImgInfo(name?: string, index?: string): void {
  }

  protected renderImgView = (img: ImgCto) => {
    const imgViewEl = img.imgViewEl;
    if (!imgViewEl) {
      return;
    }
    img.displayImgView();
    img.setWidthImgView(); // set the size of the image, e.g. zoom in/out
    img.transformImgView(); // set the position of the image, e.g. move, rotate
  }

  protected calculateImgZoomSize(realImg: HTMLImageElement, imgCto: ImgCto): ImgCto {
    const windowWidth = this.imageDomManager.ownerDoc.body.clientWidth;
    const windowHeight = this.imageDomManager.ownerDoc.body.clientHeight;
    const windowZoomWidth = windowWidth * ZOOM_FACTOR;
    const windowZoomHeight = windowHeight * ZOOM_FACTOR;

    let tempWidth = realImg.width, tempHeight = realImg.height;
    if (realImg.height > windowZoomHeight) {
      tempHeight = windowZoomHeight;
      if ((tempWidth = tempHeight / realImg.height * realImg.width) > windowZoomWidth) {
        tempWidth = windowZoomWidth;
      }
    } else if (realImg.width > windowZoomWidth) {
      tempWidth = windowZoomWidth;
      tempHeight = tempWidth / realImg.width * realImg.height;
    }
    tempHeight = tempWidth * realImg.height / realImg.width;
    // cache image info: curWidth, curHeight, realWidth, realHeight, left, top
    //imgCto.imgX = (windowWidth - tempWidth) / 2;
    //imgCto.imgY = (windowHeight - tempHeight) / 2;
    imgCto.curWidth = tempWidth;
    imgCto.curHeight = tempHeight;
    imgCto.realWidth = realImg.width;
    imgCto.realHeight = realImg.height;

    /* console.log('calculateImgZoomSize', 'realImg: ' + realImg.width + ',' + realImg.height,
        'tempSize: ' + tempWidth + ',' + tempHeight,
        'windowZoomSize: ' + windowZoomWidth + ',' + windowZoomHeight,
        'windowSize: ' + windowWidth + ',' + windowHeight); */
    return imgCto;
  }

}

export class NormalImageHandler extends ImageHandler {

  public constructor(imageDomManager: ImageDomManager) {
    super(imageDomManager);
  }

  //@Override
  protected afterRefreshImg(img: ImgCto): void {
    // this.imageDomManager.activateModeContainerEl();
    img.activateImgView();
  }

  //@Override
  protected renderImgInfo(name?: string, index?: string): void {
    if (undefined !== name && null !== name) {
      this.imageDomManager.imgTitleEl.setText(name);
    }
    if (undefined !== index && null !== index) {
      this.imageDomManager.imgIndexEl.setText(index);
    }
  }

}

export class PinImageHandler extends ImageHandler {

  public constructor(imageDomManager: ImageDomManager) {
    super(imageDomManager);
  }

  //@Override
  protected afterRefreshImg(img: ImgCto): void {
    this.activeImages.forEach(img => img.imgViewEl.removeClass('active'));
    img.activateImgView();
  }

}
