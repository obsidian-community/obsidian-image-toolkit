import { Notice, requestUrl, TFile } from 'obsidian';
import { t } from 'src/lang/helpers';
import { IMG_VIEW_MIN, ZOOM_FACTOR } from '../conf/constants'
import { ImgCto, ImgInfoIto } from "../model/container.to";
import { OffsetSizeIto } from "../model/common.to";

/**
 * Image utility class
 */
export class ImageUtil {

  public static calculateImgZoomSize = (realImg: HTMLImageElement, imgCto: ImgCto, windowWidth: number, windowHeight: number): ImgCto => {
    if (!windowWidth) {
      windowWidth = document.documentElement.clientWidth || document.body.clientWidth;
    }
    if (!windowHeight) {
      windowHeight = (document.documentElement.clientHeight || document.body.clientHeight) - 100;
    }
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

  /**
   * zoom an image
   * @param ratio
   * @param targetImgInfo
   * @param offsetSize
   * @param actualSize
   * @returns
   */
  public static zoom = (ratio: number, targetImgInfo: ImgCto, offsetSize: OffsetSizeIto, actualSize?: boolean): ImgCto => {
    let zoomRatio: number = 1;
    if (!actualSize) {
      const zoomInFlag = ratio > 0;
      ratio = zoomInFlag ? 1 + ratio : 1 / (1 - ratio);
      zoomRatio = targetImgInfo.curWidth * ratio / targetImgInfo.realWidth;
    }

    // Snap to 100% zoom when we pass over it
    const curRatio = targetImgInfo.curWidth / targetImgInfo.realWidth;
    if (actualSize || (curRatio < 1 && zoomRatio > 1) || (curRatio > 1 && zoomRatio < 1)) {
      // set zoom ratio to 100%
      zoomRatio = 1;
      // reduce snap offset ratio accordingly
      ratio = 1 / curRatio;
    }

    let newWidth = targetImgInfo.realWidth * zoomRatio;
    let newHeight = targetImgInfo.realHeight * zoomRatio;
    if (IMG_VIEW_MIN >= newWidth || IMG_VIEW_MIN >= newHeight) {
      // set minimum width or height
      if (IMG_VIEW_MIN >= newWidth) {
        newWidth = IMG_VIEW_MIN;
        newHeight = (newWidth * targetImgInfo.realHeight) / targetImgInfo.realWidth;
      } else {
        newHeight = IMG_VIEW_MIN;
        newWidth = (newHeight * targetImgInfo.realWidth) / targetImgInfo.realHeight;
      }
      ratio = 1;
    }
    const left = targetImgInfo.imgX + offsetSize.offsetX * (1 - ratio);
    const top = targetImgInfo.imgY + offsetSize.offsetY * (1 - ratio);
    // cache image info: curWidth, curHeight, left, top
    targetImgInfo.curWidth = newWidth;
    targetImgInfo.curHeight = newHeight;
    targetImgInfo.imgX = left;
    targetImgInfo.imgY = top;
    // return { newWidth, left, top };
    return targetImgInfo;
  }

  /**
   * transform =
   * - translate(x, y): move
   * - scale(x, y):
   *   - scale(2, 1): 宽度变 2 倍，高度不变
   *   - scale(0.5, 0.5): 整体缩小 50%
   *   - scale(-1, 1): X 轴镜像翻转（水平翻转
   *   - scale(1, -1): Y 轴镜像翻转（垂直翻转）
   *   - scale(-1, -1): 水平+垂直翻转（上下左右颠倒）
   * - rotate(angle): 旋转
   *   - rotate(45deg): 顺时针旋转 45°
   *   - rotate(-90deg): 逆时针旋转 90°
   * @param targetImgInfo
   */
  public static transform = (targetImgInfo: ImgCto) => {
    let transform = 'rotate(' + targetImgInfo.rotate + 'deg)';
    if (targetImgInfo.scaleX) {
      transform += ' scaleX(-1)'
    }
    if (targetImgInfo.scaleY) {
      transform += ' scaleY(-1)'
    }
    targetImgInfo.imgViewEl.style.setProperty('transform', transform);
    targetImgInfo.imgViewEl.style.transform = ``;
  }

  public static rotate = (degree: number, targetImgInfo: ImgInfoIto) => {
    targetImgInfo.imgViewEl.style.setProperty('transform', 'rotate(' + (targetImgInfo.rotate += degree) + 'deg)');
  }

  public static invertImgColor = (imgEle: HTMLImageElement, open: boolean) => {
    if (open) {
      imgEle.style.setProperty('filter', 'invert(1) hue-rotate(180deg)');
      imgEle.style.setProperty('mix-blend-mode', 'screen');
    } else {
      imgEle.style.setProperty('filter', 'none');
      imgEle.style.setProperty('mix-blend-mode', 'normal');
    }
    // open ? imgEle.addClass('image-toolkit-img-invert') : imgEle.removeClass('image-toolkit-img-invert');
  }

  public static copyText(text: string) {
    navigator.clipboard.writeText(text)
      .then(() => {
        //console.log('copyText:', copyText);
      })
      .catch(err => {
        console.error('copy text error', err);
      });
  }

  public static copyImage(imgEle: HTMLImageElement, width: number, height: number) {
    let image = new Image();
    image.crossOrigin = 'anonymous';
    const imageSrc = imgEle.src;
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        new Notice(t("COPY_IMAGE_ERROR"));
        return;
      }
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);
      try {
        canvas.toBlob(async (blob: any) => {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
            .then(() => {
              new Notice(t("COPY_IMAGE_SUCCESS"));
            }, () => {
              new Notice(t("COPY_IMAGE_ERROR"));
            });
        });
      } catch (error) {
        new Notice(t("COPY_IMAGE_ERROR"));
        console.error(error);
      }
    };
    image.onerror = () => {
      this.getImageBlogFromUrl(imageSrc)
        .catch(error => { new Notice(t("COPY_IMAGE_ERROR")); })
        .then(async (blob: Blob) => {
          if (!blob) {
            new Notice(t("COPY_IMAGE_ERROR"));
            return;
          }
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
            .then(() => {
              new Notice(t("COPY_IMAGE_SUCCESS"));
            }, () => {
              new Notice(t("COPY_IMAGE_ERROR"));
            });
        });
    }
  }

  public static async getImageBlogFromUrl(imageUrl: string): Promise<Blob | null> {
    try {
      const response = await requestUrl({ url: imageUrl });
      return new Blob([response.arrayBuffer], { type: response.headers['content-type'] });
    } catch (error) {
      console.error('Error fetching image:', error);
      return null;
    }
  }

  public static copyImage3(src: string) {

  }

  public static async copyObsidianImage(imageFile: TFile): Promise<boolean> {
    try {
      const arrayBuffer = await imageFile.vault.readBinary(imageFile);
      const blob = new Blob([arrayBuffer]);

      await navigator.clipboard.write([
        new ClipboardItem({
          [imageFile.extension === 'png' ? 'image/png' : 'image/jpeg']: blob
        })
      ]);

      return true;
    } catch (error) {
      console.error('Copy image failed:', error);
      return false;
    }
  }

  public static async copyWebImage(imageUrl: string): Promise<boolean> {
    try {
      const response = await requestUrl({ url: imageUrl });
      const blob = new Blob([response.arrayBuffer], { type: response.headers['content-type'] });

      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);

      return true;
    } catch (error) {
      console.error('Copy web image failed:', error);
      return false;
    }
  }

  public static async copyBase64Image(imageBase64: string): Promise<boolean> {
    try {
      const byteString = atob(imageBase64.split(',')[1]);
      const mimeString = imageBase64.split(',')[0].split(':')[1].split(';')[0];

      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([ab], { type: mimeString });

      await navigator.clipboard.write([
        new ClipboardItem({
          [mimeString]: blob
        })
      ]);

      return true;
    } catch (error) {
      console.error('Copy base64 image failed:', error);
      return false;
    }
  }

}
