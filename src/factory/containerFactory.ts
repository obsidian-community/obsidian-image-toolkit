import { ContainerView } from "../ui/container/container.view";

export class ContainerFactory {

  // main window container
  private mainContainer: ContainerView | null;

  // popout window containers (Open in new window): hash -> ContainerView
  private popoutContainers: Map<string, ContainerView> = new Map<string, ContainerView>();


  public setMainContainer = (container: ContainerView): void => {
    this.mainContainer = container;
  }


  public setPopoutContainer = (key: string, container: ContainerView): void => {
    this.popoutContainers.set(key, container);
  }
  public getPopoutContainer = (key: string): ContainerView | null => {
    return this.popoutContainers.get(key) || null;
  }

  public getContainer = (targetEl: HTMLImageElement): ContainerView | null => {
    const bodyEl = targetEl.ownerDocument?.body;
    if (bodyEl) {
      const oitEventKey = bodyEl.getAttribute('data-oit-event');
      if (oitEventKey) {
        // popout window
        return this.getPopoutContainer(oitEventKey);
      }
      return this.mainContainer;
    }
    return null;

    /* const bodyEl = targetEl?.matchParent('body');
    if (!bodyEl) return null;
    const oitEventKey = bodyEl.getAttribute('data-oit-event');
    if (oitEventKey) {
      //popout window
      return this.getPopoutContainer(oitEventKey);
    }
    return this.mainContainer; */
  }

  public getAllContainers = (): ContainerView[] => {
    let allContainerViews = [];
    if (this.mainContainer) {
      allContainerViews.push(this.mainContainer);
    }
    for (let value of this.popoutContainers.values()) {
      allContainerViews.push(value);
    }
    return allContainerViews;
  }

  public clearAll = () => {
    this.mainContainer = null;
    this.popoutContainers.clear();
  }

}
