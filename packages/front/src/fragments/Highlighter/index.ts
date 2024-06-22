import * as THREE from "three";
import * as FRAGS from "@thatopen/fragments";
import * as OBC from "@thatopen/components";
import { FragmentIdMap, FragmentMesh } from "@thatopen/fragments";
import { EdgesPlane, IndexFragmentMap } from "../../core";
import { FillHighlighter } from "./src";

// TODO: Clean up and document

/**
 * Interface defining the events that the Highlighter class can trigger. Each highlighter has its own set of events, identified by the highlighter name.
 */
export interface HighlightEvents {
  [highlighterName: string]: {
    /** Event triggered when a fragment is highlighted. */
    onHighlight: OBC.Event<FRAGS.FragmentIdMap>;
    /** Event triggered when a fragment is cleared. */
    onClear: OBC.Event<null>;
  };
}

/**
 * Interface defining the configuration options for the Highlighter class.
 */
export interface HighlighterConfig {
  /** Name of the selection event. */
  selectName: string;
  /** Name of the hover event. */
  hoverName: string;
  /** Color used for selection. */
  selectionColor: THREE.Color;
  /** Color used for hover. */
  hoverColor: THREE.Color;
  /** Whether to automatically highlight fragments on click. */
  autoHighlightOnClick: boolean;
  /** The world in which the highlighter operates. */
  world: OBC.World | null;
}

/**
 * This component allows highlighting and selecting fragments in a 3D scene. 📕 [Tutorial](https://docs.thatopen.com/Tutorials/Components/Front/Highlighter). 📘 [API](https://docs.thatopen.com/api/@thatopen/components-front/classes/Highlighter).
 */
export class Highlighter
  extends OBC.Component
  implements OBC.Disposable, OBC.Configurable<HighlighterConfig>
{
  /**
   * A unique identifier for the component.
   * This UUID is used to register the component within the Components system.
   */
  static readonly uuid = "cb8a76f2-654a-4b50-80c6-66fd83cafd77" as const;

  /** {@link OBC.Disposable.onDisposed} */
  readonly onDisposed = new OBC.Event();

  /** {@link OBC.Updateable.onBeforeUpdate} */
  readonly onBeforeUpdate = new OBC.Event<Highlighter>();

  /** {@link OBC.Updateable.onAfterUpdate} */
  readonly onAfterUpdate = new OBC.Event<Highlighter>();

  /** Event triggered when the Highlighter is setup. */
  readonly onSetup = new OBC.Event<Highlighter>();

  /** Indicates whether the Highlighter is setup. */
  isSetup = false;

  /** {@link OBC.Component.enabled} */
  enabled = true;

  /** Stores the events triggered by the Highlighter. */
  events: HighlightEvents = {};

  /** Determines the multiple selection behavior. */
  multiple: "none" | "shiftKey" | "ctrlKey" = "ctrlKey";

  /** Zoom factor applied when zooming to selection. */
  zoomFactor = 1.5;

  /** Indicates whether to zoom to the selection when highlighting. */
  zoomToSelection = false;

  /** Stores the backup color before selection. */
  backupColor: THREE.Color | null = null;

  /** Stores the current selection. */
  selection: {
    [selectionID: string]: FRAGS.FragmentIdMap;
  } = {};

  /** Stores the configuration options for the Highlighter. */
  config: Required<HighlighterConfig> = {
    selectName: "select",
    hoverName: "hover",
    selectionColor: new THREE.Color("#BCF124"),
    hoverColor: new THREE.Color("#6528D7"),
    autoHighlightOnClick: true,
    world: null,
  };

  /** Stores the colors used for highlighting selections. */
  colors = new Map<string, THREE.Color>();

  // Highlights the clipping fills of the fragments, if any
  private _fills = new FillHighlighter();

  private _mouseState = {
    down: false,
    moved: false,
  };

  private _colorsBeforeSelect: Record<
    string,
    { [modelID: string]: Set<number> }
  > = {};

  constructor(components: OBC.Components) {
    super(components);
    this.components.add(Highlighter.uuid, this);
  }

  /** {@link Disposable.dispose} */
  async dispose() {
    this.setupEvents(false);
    this._fills.dispose();
    this.onBeforeUpdate.reset();
    this.onAfterUpdate.reset();

    this.selection = {};
    for (const name in this.events) {
      this.events[name].onClear.reset();
      this.events[name].onHighlight.reset();
    }
    this.onSetup.reset();
    this.events = {};
    this.onDisposed.trigger(Highlighter.uuid);
    this.onDisposed.reset();
  }

  /**
   * Adds a new selection with the given name and color.
   * Throws an error if a selection with the same name already exists.
   *
   * @param name - The name of the new selection.
   * @param color - The color to be used for highlighting the selection.
   *
   * @throws Will throw an error if a selection with the same name already exists.
   */
  add(name: string, color: THREE.Color) {
    if (this.selection[name] || this.colors.has(name)) {
      throw new Error("A selection with that name already exists!");
    }
    this.colors.set(name, color);
    this.selection[name] = {};
    this.events[name] = {
      onHighlight: new OBC.Event(),
      onClear: new OBC.Event(),
    };
  }

  /**
   * Highlights a fragment based on a raycast from the mouse position.
   *
   * @param name - The name of the selection.
   * @param removePrevious - Whether to remove previous highlights.
   * @param zoomToSelection - Whether to zoom to the highlighted selection.
   * @param exclude - Fragments to exclude from the highlight.
   *
   * @returns The highlighted fragment and its ID, or null if no fragment was highlighted.
   *
   * @throws Will throw an error if the world or a required component is not found.
   * @throws Will throw an error if the selection does not exist.
   * @throws Will throw an error if the fragment or its geometry is not found.
   * @throws Will throw an error if the item ID is not found.
   * @throws Will throw an error if the fragment does not belong to a FragmentsGroup.
   */
  async highlight(
    name: string,
    removePrevious = true,
    zoomToSelection = this.zoomToSelection,
    exclude: FragmentIdMap = {},
  ): Promise<{ id: number; fragments: FRAGS.FragmentIdMap } | null> {
    if (!this.enabled) {
      return null;
    }

    if (!this.config.world) {
      throw new Error("No world found in config!");
    }

    const world = this.config.world;

    if (!this.selection[name]) {
      throw new Error(`Selection ${name} does not exist.`);
    }

    const allMeshes: THREE.Mesh[] = [];

    const fragments = this.components.get(OBC.FragmentsManager);
    const fragMeshes = fragments.meshes;
    for (const mesh of fragMeshes) {
      allMeshes.push(mesh);
    }

    // If a clipping fill is found when raycasting, add it to raycast test
    // so that clipped things can be selected in floorplan / section views
    const clipper = this.components.get(OBC.Clipper);
    for (const plane of clipper.list) {
      const edgesPlane = plane as EdgesPlane;
      if (edgesPlane.edges) {
        const fillMeshes = edgesPlane.edges.fillMeshes;
        for (const mesh of fillMeshes) {
          allMeshes.push(mesh);
        }
      }
    }

    const casters = this.components.get(OBC.Raycasters);
    const caster = casters.get(world);
    const result = caster.castRay(allMeshes);

    if (!result || !result.face) {
      this.clear(name);
      return null;
    }

    const mesh = result.object as FragmentMesh;

    // If found mesh is a clipping fill, highlight corresponding frag mesh
    if (!mesh.fragment && mesh.userData.indexFragmentMap) {
      if (result.faceIndex === undefined || !mesh.geometry.index) {
        return null;
      }

      const { userData } = mesh;
      const fragMap = userData.indexFragmentMap as IndexFragmentMap;
      const itemFoundInFillMesh = fragMap.get(result.faceIndex);

      if (itemFoundInFillMesh) {
        await this.highlightByID(
          name,
          itemFoundInFillMesh,
          removePrevious,
          zoomToSelection,
          exclude,
          mesh,
        );

        const fragID = Object.keys(itemFoundInFillMesh)[0];
        const itemID = Array.from(itemFoundInFillMesh[fragID])[0];
        return { id: itemID, fragments: itemFoundInFillMesh };
      }

      return null;
    }

    const geometry = mesh.geometry;
    const instanceID = result.instanceId;
    if (!geometry || instanceID === undefined) {
      return null;
    }
    const itemID = mesh.fragment.getItemID(instanceID);
    if (itemID === null) {
      throw new Error("Item ID not found!");
    }

    const group = mesh.fragment.group;
    if (!group) {
      throw new Error("Fragment must belong to a FragmentsGroup!");
    }

    const found = group.getFragmentMap([itemID]);

    await this.highlightByID(
      name,
      found,
      removePrevious,
      zoomToSelection,
      exclude,
    );

    return { id: itemID, fragments: found };
  }

  /**
   * Highlights a fragment based on a given fragment ID map.
   *
   * @param name - The name of the selection.
   * @param fragmentIdMap - The fragment ID map to highlight.
   * @param removePrevious - Whether to remove previous highlights.
   * @param zoomToSelection - Whether to zoom to the highlighted selection.
   * @param exclude - Fragments to exclude from the highlight.
   * @param fillMesh - The fill mesh to also highlight, if any.
   *
   * @returns Promise that resolves when the highlighting is complete.
   *
   * @throws Will throw an error if the selection does not exist.
   * @throws Will throw an error if the fragment or its geometry is not found.
   * @throws Will throw an error if the item ID is not found.
   * @throws Will throw an error if the fragment does not belong to a FragmentsGroup.
   */
  async highlightByID(
    name: string,
    fragmentIdMap: FragmentIdMap,
    removePrevious = true,
    zoomToSelection = this.zoomToSelection,
    exclude: FragmentIdMap = {},
    fillMesh: THREE.Mesh | undefined = undefined,
  ) {
    if (!this.enabled) return;

    if (removePrevious) {
      this.clear(name);
    }

    const fragments = this.components.get(OBC.FragmentsManager);

    const color = this.colors.get(name);
    if (!color) {
      throw new Error("Color for selection not found!");
    }

    const filtered: FragmentIdMap = {};

    for (const fragID in fragmentIdMap) {
      const ids = fragmentIdMap[fragID];
      const excludeFrag = exclude[fragID];

      for (const id of ids) {
        if (!excludeFrag || !excludeFrag.has(id)) {
          if (!filtered[fragID]) {
            filtered[fragID] = new Set();
          }
          filtered[fragID].add(id);
        }
      }
    }

    for (const fragID in filtered) {
      const fragment = fragments.list.get(fragID);
      if (!fragment) {
        continue;
      }
      if (!this.selection[name][fragID]) {
        this.selection[name][fragID] = new Set<number>();
      }
      const itemIDs = fragmentIdMap[fragID];
      for (const itemID of itemIDs) {
        this.selection[name][fragID].add(itemID);
        fragment.setColor(color, [itemID]);
      }

      // Highlight all the clipping fills of the fragment, if any
      if (fragment.mesh.userData.fills) {
        for (const fill of fragment.mesh.userData.fills) {
          this._fills.highlight(name, fill, color, fragmentIdMap);
        }
      }
    }

    this.events[name].onHighlight.trigger(this.selection[name]);

    // Highlight the given fill mesh (e.g. when selecting a clipped element in floorplan)
    if (fillMesh) {
      this._fills.highlight(name, fillMesh, color, fragmentIdMap);
    }

    if (zoomToSelection) {
      await this.zoomSelection(name);
    }
  }

  /**
   * Clears the selection for the given name or all selections if no name is provided.
   *
   * @param name - The name of the selection to clear. If not provided, clears all selections.
   *
   * @throws Will throw an error if the FragmentsManager is not found.
   * @throws Will throw an error if the fragment or its geometry is not found.
   * @throws Will throw an error if the item ID is not found.
   * @throws Will throw an error if the fragment does not belong to a FragmentsGroup.
   */
  clear(name?: string) {
    const names = name ? [name] : Object.keys(this.selection);

    for (const name of names) {
      this._fills.clear(name);

      const fragments = this.components.get(OBC.FragmentsManager);

      const selected = this.selection[name];

      for (const fragID in this.selection[name]) {
        const fragment = fragments.list.get(fragID);

        if (!fragment) continue;
        const ids = selected[fragID];
        if (!ids) continue;
        if (this.backupColor) {
          fragment.setColor(this.backupColor);
        } else {
          fragment.resetColor(ids);
        }
      }

      this.events[name].onClear.trigger(null);
      this.selection[name] = {};
    }
  }

  /**
   * Sets up the Highlighter with the provided configuration.
   *
   * @param config - Optional configuration for the Highlighter.
   * If not provided, the Highlighter will use the default configuration.
   *
   * @throws Will throw an error if the world or a required component is not found.
   * @throws Will throw an error if the selection already exists.
   * @throws Will throw an error if the fragment or its geometry is not found.
   * @throws Will throw an error if the item ID is not found.
   * @throws Will throw an error if the fragment does not belong to a FragmentsGroup.
   */
  setup(config?: Partial<HighlighterConfig>) {
    this.config = { ...this.config, ...config };
    this.add(this.config.selectName, this.config.selectionColor);
    this.add(this.config.hoverName, this.config.hoverColor);
    this.setupEvents(true);
    this.enabled = true;
    this.isSetup = true;
    this.onSetup.trigger(this);
  }

  private async zoomSelection(name: string) {
    if (!this.config.world) {
      throw new Error("No world found in config!");
    }
    const world = this.config.world;

    if (!world.camera.hasCameraControls()) {
      return;
    }

    const bbox = this.components.get(OBC.BoundingBoxer);
    const fragments = this.components.get(OBC.FragmentsManager);
    bbox.reset();

    const selected = this.selection[name];
    if (!Object.keys(selected).length) {
      return;
    }

    for (const fragID in selected) {
      const fragment = fragments.list.get(fragID);
      if (!fragment) continue;
      const ids = selected[fragID];
      bbox.addMesh(fragment.mesh, ids);
    }

    const sphere = bbox.getSphere();
    const i = Infinity;
    const mi = -Infinity;
    const { x, y, z } = sphere.center;
    const isInf = sphere.radius === i || x === i || y === i || z === i;
    const isMInf = sphere.radius === mi || x === mi || y === mi || z === mi;
    const isZero = sphere.radius === 0;
    if (isInf || isMInf || isZero) {
      return;
    }

    sphere.radius *= this.zoomFactor;
    const camera = world.camera;
    await camera.controls.fitToSphere(sphere, true);
  }

  private saveHighlightersBeforeSelect = (
    fragmentIdMap: FRAGS.FragmentIdMap,
  ) => {
    const fragments = this.components.get(OBC.FragmentsManager);
    for (const fragmentID in fragmentIdMap) {
      const fragment = fragments.list.get(fragmentID);
      if (!fragment) continue;
      const modelID = fragment.group?.uuid;
      if (!modelID) continue;
      for (const name in this.selection) {
        if (name === this.config.selectName || name === this.config.hoverName)
          continue;
        const expressIDs = this.selection[name][fragmentID];
        if (expressIDs) {
          if (!(name in this._colorsBeforeSelect))
            this._colorsBeforeSelect[name] = {};
          if (!(modelID in this._colorsBeforeSelect[name]))
            this._colorsBeforeSelect[name] = { [modelID]: new Set() };
          for (const expressID of expressIDs) {
            this._colorsBeforeSelect[name][modelID].add(expressID);
          }
        }
      }
    }
  };

  private restoreHighlightersAfterDeselect = () => {
    const fragments = this.components.get(OBC.FragmentsManager);
    for (const name in this._colorsBeforeSelect) {
      let fragmentIdMap: FRAGS.FragmentIdMap = {};
      const modelIdMap = this._colorsBeforeSelect[name];
      for (const modelID in modelIdMap) {
        const model = fragments.groups.get(modelID);
        if (!model) continue;
        const modelFragmentIdMap = model.getFragmentMap(modelIdMap[modelID]);
        fragmentIdMap = { ...fragmentIdMap, ...modelFragmentIdMap };
      }
      this.highlightByID(name, fragmentIdMap, false, false);
    }
    this._colorsBeforeSelect = {};
  };

  private setupEvents(active: boolean) {
    if (!this.config.world) {
      throw new Error("No world found while setting up events!");
    }

    if (this.config.world.isDisposing) {
      return;
    }

    if (!this.config.world.renderer) {
      throw new Error("The given world doesn't have a renderer!");
    }

    const container = this.config.world.renderer.three.domElement;

    const onHighlight = this.events[this.config.selectName].onHighlight;
    onHighlight.remove(this.clearHover);
    onHighlight.remove(this.saveHighlightersBeforeSelect);

    const onSelectClear = this.events[this.config.selectName].onClear;
    onSelectClear.remove(this.restoreHighlightersAfterDeselect);

    container.removeEventListener("mousedown", this.onMouseDown);
    container.removeEventListener("mouseup", this.onMouseUp);
    container.removeEventListener("mousemove", this.onMouseMove);

    if (active) {
      onHighlight.add(this.clearHover);
      onHighlight.add(this.saveHighlightersBeforeSelect);
      onSelectClear.add(this.restoreHighlightersAfterDeselect);
      container.addEventListener("mousedown", this.onMouseDown);
      container.addEventListener("mouseup", this.onMouseUp);
      container.addEventListener("mousemove", this.onMouseMove);
    }
  }

  private clearHover = () => {
    this.selection[this.config.hoverName] = {};
  };

  private onMouseDown = () => {
    if (!this.enabled) return;
    this._mouseState.down = true;
  };

  private onMouseUp = async (event: MouseEvent) => {
    const world = this.config.world;
    if (!world) {
      throw new Error("No world found!");
    }
    if (!world.renderer) {
      throw new Error("This world doesn't have a renderer!");
    }
    if (!this.enabled) return;
    if (event.target !== world.renderer.three.domElement) return;
    this._mouseState.down = false;
    if (this._mouseState.moved || event.button !== 0) {
      this._mouseState.moved = false;
      return;
    }
    this._mouseState.moved = false;
    if (this.config.autoHighlightOnClick) {
      const mult = this.multiple === "none" ? true : !event[this.multiple];
      await this.highlight(this.config.selectName, mult, this.zoomToSelection);
    }
  };

  private onMouseMove = async () => {
    if (!this.enabled) return;
    if (this._mouseState.moved) {
      this.clear(this.config.hoverName);
      return;
    }

    this._mouseState.moved = this._mouseState.down;
    const excluded: FRAGS.FragmentIdMap = {};
    for (const name in this.selection) {
      if (name === this.config.hoverName) continue;
      const fragmentIdMap = this.selection[name];
      for (const fragmentID in fragmentIdMap) {
        if (!(fragmentID in excluded)) excluded[fragmentID] = new Set();
        const expressIDs = fragmentIdMap[fragmentID];
        for (const expressID of expressIDs) {
          excluded[fragmentID].add(expressID);
        }
      }
    }
    await this.highlight(this.config.hoverName, true, false, excluded);
  };
}
