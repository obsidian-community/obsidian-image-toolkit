import { OIT_CLASS, ViewModeEnum } from "src/conf/constants";
import { ContainerViewNew } from "./container.view";
import { NormalContainerNew } from "./normalContainer.view";
import { PinContainerNew } from "./pinContainer.view";
import ImageToolkitPlugin from "src/main";

export class ContainerHandler {

  private readonly containerMap = new Map<ViewModeEnum, ContainerViewNew>();

  // root level container under <body>: `<div class="oit">...</div>`
  private readonly rootContainerEl: HTMLDivElement;

  constructor(plugin: ImageToolkitPlugin, ownerDoc: Document) {
    this.rootContainerEl = createDiv({ cls: OIT_CLASS.CONTAINER_ROOT, parent: ownerDoc.body });

    this.containerMap.set(ViewModeEnum.Normal, new NormalContainerNew(plugin, ownerDoc, this.rootContainerEl));
    this.containerMap.set(ViewModeEnum.Pin, new PinContainerNew(plugin, ownerDoc, this.rootContainerEl));
  }

  public getAllContainerViews(): MapIterator<ContainerViewNew> {
    return this.containerMap.values();
  }

  public getContainerViewByViewMode(viewMode: ViewModeEnum): ContainerViewNew | null {
    return this.containerMap.get(viewMode) || null;
  }

  public unload() {
    for (const container of this.containerMap.values()) {
      container.unload();
    }
    this.rootContainerEl.remove();

    this.containerMap.clear();
  }

}
