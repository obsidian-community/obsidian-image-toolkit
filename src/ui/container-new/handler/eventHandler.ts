import { ImageDomManager, ImgCto, ImgOprStateCto } from "src/model/container.to";
import { OIT_CLASS, ViewModeEnum } from "src/conf/constants";
import { ContainerViewNew } from "../container.view";
import { OffsetSizeIto } from "src/model/common.to";
import { ImageUtil } from "src/util/image.util";

export abstract class EventHandlerFactory {

  public static createEventHandler(viewMode: ViewModeEnum,
    imageDomManager: ImageDomManager,
    containerView: ContainerViewNew,
    imgGlobalState: ImgOprStateCto): IEventHandler {
    switch (viewMode) {
      case ViewModeEnum.Normal:
        return new NormalEventHandler(imageDomManager, containerView, imgGlobalState);
      case ViewModeEnum.Pin:
        return new PinEventHandler(imageDomManager, containerView, imgGlobalState);
      default:
        throw new Error(`Unsupported view mode: ${viewMode}`);
    }
  }

}

export interface IEventHandler {
  init(img: ImgCto): void;
  destroy(img: ImgCto): void;
}

export abstract class BaseEventHandler implements IEventHandler {
  constructor(
    protected imageDomManager: ImageDomManager,
    protected containerView: ContainerViewNew,
    protected imgGlobalState: ImgOprStateCto) { }

  abstract init(img: ImgCto): void;
  abstract destroy(img: ImgCto): void;

  protected mouseenterImgViewEvent = (event: MouseEvent) => {
    console.log('[D]mouseenterImgView:', 'dragging=' + this.imgGlobalState.dragging);
    this.containerView.resetClickTimer();
    // this.getAndUpdateActiveImg(event);
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

    this.containerView.resetClickTimer();
    /* if (this.imgGlobalState.activeImg) {
      this.setGlobalActiveImg(null); // for pin mode
    } */
  }

  protected mousedownImgViewEvent = (event: MouseEvent) => {
    console.log('[D]mousedownImgView:', 'offsetX=' + event?.offsetX, 'offsetY=' + event?.offsetY);
    event.preventDefault();
    // event.stopPropagation();

    const activeImg = this.containerView.getAndUpdateActiveImg(event);
    if (!activeImg) {
      console.log('[D]mousedownImgView:', 'No activeImg');
      return;
    }
    activeImg.activateImgView();
    if (0 === event.button) { // left click
      this.containerView.setClickTimer(activeImg);
      this.containerView.setActiveImgZIndex(activeImg);
      this.imgGlobalState.dragging = true;

      activeImg.lastImgX = event.clientX;
      activeImg.lastImgY = event.clientY;

      activeImg.imgViewEl.addClass('dragging');

      this.imageDomManager.ownerDoc.addEventListener('mousemove', this.mousemoveImgViewEvent);
    }
    this.imageDomManager.ownerDoc.addEventListener('mouseup', this.mouseupImgViewEvent);
  }

  protected mousemoveImgViewEvent = (event: MouseEvent) => {
    console.log('[D]mousemoveImgView:', 'clientX=' + event?.clientX, 'clientY=' + event?.clientY);
    const activeImg = this.imgGlobalState.activeImg;
    if (!activeImg) {
      console.warn('[oit] mousemoveImgView: found no activeImg!');
      return;
    }
    if (!this.imgGlobalState.dragging) {
      console.warn('[oit] mousemoveImgView: no dragging!');
      return;
    }
    // drag via mouse cursor
    activeImg.imgX = (event.clientX - activeImg.lastImgX) + activeImg.imgX;
    activeImg.imgY = (event.clientY - activeImg.lastImgY) + activeImg.imgY;

    activeImg.lastImgX = event.clientX;
    activeImg.lastImgY = event.clientY;

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
    // activeImg.imgViewEl.style.transform = `translate(${activeImg.imgX}px, ${activeImg.imgY}px)`;

    activeImg.transformImgView();
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
        this.containerView.menuView.show(event, activeImg);
      }
    }
  }

  protected mousewheelImgViewEvent = (event: WheelEvent) => {
    console.log('[D]mousewheelImgView', event.deltaMode, event.deltaX, event.deltaY, event.deltaZ);
    event.preventDefault();
    event.stopPropagation();
    // @ts-ignore
    this.zoomImage(0 < event.wheelDelta ? 0.1 : -0.1, event);
  }

  protected zoomImage(ratio: number, event?: WheelEvent | null, actualSize?: boolean, activeImg?: ImgCto | null) {
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
    // this.renderImgTip(activeImg);

    zoomData.setWidthImgView();
    zoomData.transformImgView();
    /* activeImgViewEl.setAttribute('width', zoomData.curWidth + 'px');
    activeImgViewEl.style.setProperty('margin-top', zoomData.top + 'px', 'important');
    activeImgViewEl.style.setProperty('margin-left', zoomData.left + 'px', 'important'); */
  }

}

export class NormalEventHandler extends BaseEventHandler {

  private mousedownModeContainerClass: string;

  //@Override
  public init(img: ImgCto): void {
    // mousedown+mouseup: closeContainer
    this.imageDomManager.modeContainerEl.addEventListener('mousedown', this.mousedownModeContainerEvent);
    this.imageDomManager.modeContainerEl.addEventListener('mouseup', this.mouseupModeContainerEvent);

    // const doc = this.containerView.imageDomManager.ownerDoc;
    // doc.addEventListener('keydown', this.handleKeyDown);
    // doc.addEventListener('keyup', this.handleKeyUp);

    img.imgViewEl.addEventListener('mouseenter', this.mouseenterImgViewEvent);
    img.imgViewEl.addEventListener('mouseleave', this.mouseleaveImgViewEvent);
    // drag the image via mouse
    img.imgViewEl.addEventListener('mousedown', this.mousedownImgViewEvent);
    // zoom the image via mouse wheel
    img.imgViewEl.addEventListener('mousewheel', this.mousewheelImgViewEvent, { passive: true });
  }

  //@Override
  public destroy(img: ImgCto): void {
    this.imageDomManager.modeContainerEl.removeEventListener('mousedown', this.mousedownModeContainerEvent);
    this.imageDomManager.modeContainerEl.removeEventListener('mouseup', this.mouseupModeContainerEvent);

    // const doc = this.containerView.imageDomManager.ownerDoc;
    // doc.removeEventListener('keydown', this.handleKeyDown);
    // doc.removeEventListener('keyup', this.handleKeyUp);

    img.imgViewEl.removeEventListener('mouseenter', this.mouseenterImgViewEvent);
    img.imgViewEl.removeEventListener('mouseleave', this.mouseleaveImgViewEvent);
    // drag the image via mouse
    img.imgViewEl.removeEventListener('mousedown', this.mousedownImgViewEvent);
    // zoom the image via mouse wheel
    img.imgViewEl.removeEventListener('mousewheel', this.mousewheelImgViewEvent);
  }

  private mousedownModeContainerEvent = (event: MouseEvent) => {
    const targetEl = (<HTMLElement>event.target);
    console.log('[D]==>mousedown:', targetEl.className);
    this.mousedownModeContainerClass = targetEl?.className;
  }

  private mouseupModeContainerEvent = (event: MouseEvent) => {
    const targetEl = (<HTMLElement>event.target);
    console.log('[D]==>mouseup:', targetEl.className);
    if (!this.mousedownModeContainerClass || this.mousedownModeContainerClass !== targetEl?.className) {
      return;
    }
    const activeImg = this.imgGlobalState.activeImg;
    if (activeImg) {
      this.containerView.closeContainer(event, activeImg);
    }
  }

}

export class PinEventHandler extends BaseEventHandler {

  //@Override
  public init(img: ImgCto): void {
    // const container = this.containerView.imageDomManager.modeContainerEl;
    // container.addEventListener('mouseenter', this.handleMouseEnter);
    // container.addEventListener('mousedown', this.handleMouseDown);
    // container.addEventListener('mouseleave', this.handleMouseLeave);
    // container.addEventListener('wheel', this.handleMouseWheel);
  }

  //@Override
  public destroy(img: ImgCto): void {
    // const container = this.containerView.imageDomManager.modeContainerEl;
    // container.removeEventListener('mouseenter', this.handleMouseEnter);
    // container.removeEventListener('mousedown', this.handleMouseDown);
    // container.removeEventListener('mouseleave', this.handleMouseLeave);
    // container.removeEventListener('wheel', this.handleMouseWheel);
  }

}
