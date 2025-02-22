import ImageToolkitPlugin from "src/main";
import { ContainerHandler } from "src/ui/container-new/container.handler";
import { ContainerViewNew } from "src/ui/container-new/container.view";

export class ContainerFactoryNew {

  // main window container
  private readonly mainContainerHandler: ContainerHandler;

  // popout window containers (Open in new window): hash (eventId) -> ContainerHandler
  public readonly popoutContainerHandlers: Map<string, ContainerHandler> = new Map<string, ContainerHandler>();


  constructor(private readonly plugin: ImageToolkitPlugin) {
    this.mainContainerHandler = new ContainerHandler(plugin, document);
  }

  public hasPopoutContainer(key: string | null): boolean {
    return !!key && this.popoutContainerHandlers.has(key);
  }

  public addPopoutContainer(key: string, doc: Document) {
    this.popoutContainerHandlers.set(key, new ContainerHandler(this.plugin, doc));
  }

  public removePopoutContainer(key: string) {
    this.popoutContainerHandlers.delete(key);
  }

  public getContainerView(targetEl: HTMLImageElement): ContainerViewNew | null {
    const oitEventKey = targetEl.ownerDocument.body.getAttribute(ImageToolkitPlugin.POPOUT_WINDOW_EVENT);
    const containerHandler = oitEventKey ? this.popoutContainerHandlers.get(oitEventKey) : this.mainContainerHandler;
    return containerHandler?.getContainerViewByViewMode(this.plugin.settings.viewMode) || null;
  }

  public getAllContainerViews(): ContainerViewNew[] {
    let allContainerViews: ContainerViewNew[] = [];
    for (const cv of this.mainContainerHandler.getAllContainerViews()) {
      allContainerViews.push(cv);
    }
    for (const ch of this.popoutContainerHandlers.values()) {
      for (const cv of ch.getAllContainerViews()) {
        allContainerViews.push(cv);
      }
    }
    return allContainerViews;
  }

  public unload() {
    this.mainContainerHandler.unload();

    for (const containerHandler of this.popoutContainerHandlers.values()) {
      containerHandler.unload();
    }
    this.popoutContainerHandlers.clear();
  }

}
