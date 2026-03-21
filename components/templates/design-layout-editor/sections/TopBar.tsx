"use client";

import Image from "next/image";
import type { BuilderDraft, MicrositeBlock, TextStyle } from "@/lib/templates/builder";
import type { DraftWithPageExtras, SelectedContext } from "../types";

import {
  FONT_FAMILY_OPTIONS,
  MAX_CANVAS_ZOOM,
  MIN_CANVAS_ZOOM,
} from "../constants";

import {
  infoPillClass,
  resolveFontFamily,
  topBarButtonClass,
  topBarColorClass,
  topBarFieldClass,
  topBarSliderClass,
  topBarSliderWrapClass,
} from "../utils";

type TopBarProps = {
  draft: BuilderDraft;
  selectedContext: SelectedContext;
  selectedBlock: MicrositeBlock | null;
  selectedTextFxBlock: MicrositeBlock | null;
  isTextFxSelected: boolean;
  selectedStyle: Partial<TextStyle>;
  selectedAppearance: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
  };
  selectedPageBackgroundColor: string;
  selectedBold: boolean;
  selectedItalic: boolean;
  selectedUnderline: boolean;
  selectedStrike: boolean;
  showTextControls: boolean;
  showAppearanceControls: boolean;
  showBorderWidthRadiusControls: boolean;
  resolvedPageColor: string;
  canvasZoom: number;
  undoDisabled: boolean;
  redoDisabled: boolean;
  aiDisabled: boolean;
  backgroundImageDisabled: boolean;

  onUndo: () => void;
  onRedo: () => void;
  onAioClick: () => void;
  onApplyStylePatch: (patch: Partial<TextStyle>) => void;
  onApplyAppearancePatch: (patch: {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
  }) => void;
  onApplyPageTextBackgroundColor: (value: string) => void;
  onClearPageTextBackgroundColor: () => void;
  onUpdateTextFx: (patch: Partial<{
    mode: "straight" | "arch" | "dip" | "circle";
    intensity: number;
    rotation: number;
    opacity: number;
  }>) => void;
  onResetSelectedTextFx: () => void;
  onUpdateSelectedBlock: (updater: (block: MicrositeBlock) => MicrositeBlock) => void;
  onUpdateSelectedImagePatch: (patch: Partial<{
    positionX: number;
    positionY: number;
    zoom: number;
    rotation: number;
  }>) => void;
  onRemoveAllBlocks: () => void;
  onUploadPageBackgroundImage: () => void;
  onClearPageBackgroundImage: () => void;
  onUpdatePageBackgroundImageFit: (value: "clip" | "zoom" | "stretch") => void;
  onSetPageColor: (value: string) => void;
  onZoomOut: () => void;
  onZoomIn: () => void;
};

export default function TopBar(props: TopBarProps) {
  const {
    draft,
    selectedContext,
    selectedBlock,
    selectedTextFxBlock,
    isTextFxSelected,
    selectedStyle,
    selectedAppearance,
    selectedPageBackgroundColor,
    selectedBold,
    selectedItalic,
    selectedUnderline,
    selectedStrike,
    showTextControls,
    showAppearanceControls,
    showBorderWidthRadiusControls,
    resolvedPageColor,
    canvasZoom,
    undoDisabled,
    redoDisabled,
    aiDisabled,
    backgroundImageDisabled,
    onUndo,
    onRedo,
    onAioClick,
    onApplyStylePatch,
    onApplyAppearancePatch,
    onApplyPageTextBackgroundColor,
    onClearPageTextBackgroundColor,
    onUpdateTextFx,
    onResetSelectedTextFx,
    onUpdateSelectedBlock,
    onUpdateSelectedImagePatch,
    onRemoveAllBlocks,
    onUploadPageBackgroundImage,
    onClearPageBackgroundImage,
    onUpdatePageBackgroundImageFit,
    onSetPageColor,
    onZoomOut,
    onZoomIn,
  } = props;

  return (
    <div className="sticky top-0 z-50 border-b border-black/10 bg-[#2f3541] px-6 py-3 text-white shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            className={topBarButtonClass(false, undoDisabled)}
            title="Undo"
            onClick={onUndo}
            disabled={undoDisabled}
          >
            ↶
          </button>

          <button
            type="button"
            className={topBarButtonClass(false, redoDisabled)}
            title="Redo"
            onClick={onRedo}
            disabled={redoDisabled}
          >
            ↷
          </button>

          <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

          <div className={infoPillClass()}>{selectedContext.label}</div>

          <button
            type="button"
            className={topBarButtonClass(false, aiDisabled)}
            onClick={onAioClick}
            disabled={aiDisabled}
            title="Artificial Intelligent Output"
          >
            <Image
              src="/icons/icon_wand_aio.png"
              alt="AIO"
              width={36}
              height={36}
              className="h-[36px] w-[36px] object-contain"
            />
          </button>

          {isTextFxSelected ? (
            <>
              <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

              <button
                type="button"
                className={topBarButtonClass(
                  (selectedTextFxBlock as any)?.data?.fx?.mode === "straight",
                )}
                onClick={() => onUpdateTextFx({ mode: "straight" })}
                title="Straight"
              >
                <Image src="/icons/fx_straight_icon.png" alt="Straight" width={20} height={20} className="object-contain" />
              </button>

              <button
                type="button"
                className={topBarButtonClass(
                  (selectedTextFxBlock as any)?.data?.fx?.mode === "arch",
                )}
                onClick={() => onUpdateTextFx({ mode: "arch" })}
                title="Arch"
              >
                <Image src="/icons/fx_arch_icon.png" alt="Arch" width={20} height={20} className="object-contain" />
              </button>

              <button
                type="button"
                className={topBarButtonClass(
                  (selectedTextFxBlock as any)?.data?.fx?.mode === "dip",
                )}
                onClick={() => onUpdateTextFx({ mode: "dip" })}
                title="Dip"
              >
                <Image src="/icons/fx_dip_icon.png" alt="Dip" width={20} height={20} className="object-contain" />
              </button>

              <button
                type="button"
                className={topBarButtonClass(
                  (selectedTextFxBlock as any)?.data?.fx?.mode === "circle",
                )}
                onClick={() => onUpdateTextFx({ mode: "circle" })}
                title="Circle"
              >
                <Image src="/icons/fx_circle_icon.png" alt="Circle" width={20} height={20} className="object-contain" />
              </button>

              <button
                type="button"
                className={topBarButtonClass(false)}
                onClick={onResetSelectedTextFx}
                title="Reset TextFX"
              >
                <Image src="/icons/fx_reset_icon.png" alt="Reset" width={20} height={20} className="object-contain" />
              </button>

              <div className={topBarSliderWrapClass()}>
                <span>Curve</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={(selectedTextFxBlock as any)?.data?.fx?.intensity ?? 50}
                  onChange={(e) => onUpdateTextFx({ intensity: Number(e.target.value) })}
                  className={topBarSliderClass()}
                  title="Curve intensity"
                />
                <span>{(selectedTextFxBlock as any)?.data?.fx?.intensity ?? 50}</span>
              </div>

              <div className={topBarSliderWrapClass()}>
                <span>Rotate</span>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  value={(selectedTextFxBlock as any)?.data?.fx?.rotation ?? 0}
                  onChange={(e) => onUpdateTextFx({ rotation: Number(e.target.value) })}
                  className={topBarSliderClass()}
                  title="Rotation"
                />
                <span>{(selectedTextFxBlock as any)?.data?.fx?.rotation ?? 0}°</span>
              </div>

              <div className={topBarSliderWrapClass()}>
                <span>Opacity</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round((((selectedTextFxBlock as any)?.data?.fx?.opacity ?? 1) as number) * 100)}
                  onChange={(e) => onUpdateTextFx({ opacity: Number(e.target.value) / 100 })}
                  className={topBarSliderClass()}
                  title="Opacity"
                />
                <span>{Math.round((((selectedTextFxBlock as any)?.data?.fx?.opacity ?? 1) as number) * 100)}%</span>
              </div>
            </>
          ) : null}

          {showTextControls ? (
            <>
              <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

              <button type="button" className={topBarButtonClass(selectedBold)} onClick={() => onApplyStylePatch({ bold: !selectedBold })} title="Bold">
                B
              </button>

              <button type="button" className={topBarButtonClass(selectedItalic)} onClick={() => onApplyStylePatch({ italic: !selectedItalic })} title="Italic">
                I
              </button>

              <button type="button" className={topBarButtonClass(selectedUnderline)} onClick={() => onApplyStylePatch({ underline: !selectedUnderline })} title="Underline">
                U
              </button>

              <button type="button" className={topBarButtonClass(selectedStrike)} onClick={() => onApplyStylePatch({ strike: !selectedStrike })} title="Strikethrough">
                S̶
              </button>

              <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

              <button type="button" className={topBarButtonClass(false)} onClick={() => onApplyStylePatch({ align: "left" })} title="Align left">
                ≡
              </button>

              <button type="button" className={topBarButtonClass(false)} onClick={() => onApplyStylePatch({ align: "center" })} title="Align center">
                ≣
              </button>

              <button type="button" className={topBarButtonClass(false)} onClick={() => onApplyStylePatch({ align: "right" })} title="Align right">
                ☰
              </button>

              <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

              <select
                value={selectedStyle.fontFamily ?? "inherit"}
                onChange={(e) => onApplyStylePatch({ fontFamily: e.target.value })}
                className={topBarFieldClass("min-w-[190px]")}
                title="Font family"
                style={{
                  fontFamily: resolveFontFamily(selectedStyle.fontFamily ?? "inherit"),
                }}
              >
                {FONT_FAMILY_OPTIONS.map((font) => (
                  <option key={font} value={font} style={{ fontFamily: resolveFontFamily(font) }}>
                    {font}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min={8}
                max={480}
                value={selectedStyle.fontSize ?? 16}
                onChange={(e) =>
                  onApplyStylePatch({
                    fontSize: Math.max(8, Math.min(480, Number(e.target.value) || 16)),
                  })
                }
                className={topBarFieldClass("w-24")}
                title="Font size"
              />

              <input
                type="color"
                value={selectedStyle.color ?? "#111827"}
                onChange={(e) => onApplyStylePatch({ color: e.target.value })}
                className={topBarColorClass(false)}
                title="Text color"
              />

              {selectedContext.kind === "pageText" ? (
                <>
                  <input
                    type="color"
                    value={selectedPageBackgroundColor === "transparent" ? "#ffffff" : selectedPageBackgroundColor}
                    onChange={(e) => onApplyPageTextBackgroundColor(e.target.value)}
                    className={topBarColorClass(false)}
                    title="Text box background color"
                  />

                  <button
                    type="button"
                    className={topBarButtonClass(selectedPageBackgroundColor === "transparent")}
                    onClick={onClearPageTextBackgroundColor}
                    title="Transparent text box background"
                  >
                    ☐
                  </button>
                </>
              ) : null}

              {selectedBlock?.type === "thread" ? (
                <>
                  <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

                  <div className={topBarSliderWrapClass()}>
                    <span>Visible</span>
                    <input
                      type="range"
                      min={1}
                      max={8}
                      value={(selectedBlock as any).data.maxVisibleMessages ?? 4}
                      onChange={(e) =>
                        onUpdateSelectedBlock((block) =>
                          block.type !== "thread"
                            ? block
                            : {
                                ...block,
                                data: {
                                  ...block.data,
                                  maxVisibleMessages: Math.max(1, Math.min(8, Number(e.target.value) || 4)),
                                },
                              },
                        )
                      }
                      className={topBarSliderClass()}
                      title="Max visible messages"
                    />
                    <span>{(selectedBlock as any).data.maxVisibleMessages ?? 4}</span>
                  </div>
                </>
              ) : null}
            </>
          ) : null}

          {selectedBlock?.type === "image" ? (
            <>
              <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

              <select
                value={selectedBlock.data.image.fitMode ?? "zoom"}
                onChange={(e) =>
                  onUpdateSelectedBlock((block) =>
                    block.type !== "image"
                      ? block
                      : {
                          ...block,
                          data: {
                            ...block.data,
                            image: {
                              ...block.data.image,
                              fitMode: e.target.value as "clip" | "stretch" | "zoom",
                            },
                          },
                        },
                  )
                }
                className={topBarFieldClass("w-[120px]")}
                title="Image fit mode"
              >
                <option value="clip">Clip</option>
                <option value="zoom">Zoom</option>
                <option value="stretch">Stretch</option>
              </select>

              <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

              {(["square", "circle", "diamond", "heart"] as const).map((frame) => (
                <button
                  key={frame}
                  type="button"
                  className={topBarButtonClass((selectedBlock.data.image.frame ?? "square") === frame)}
                  onClick={() =>
                    onUpdateSelectedBlock((block) =>
                      block.type !== "image"
                        ? block
                        : {
                            ...block,
                            data: {
                              ...block.data,
                              image: {
                                ...block.data.image,
                                frame,
                              },
                            },
                          },
                    )
                  }
                  title={`${frame} frame`}
                >
                  <Image
                    src={`/icons/${frame}_icon.png`}
                    alt={frame}
                    width={18}
                    height={18}
                    className="pointer-events-none"
                  />
                </button>
              ))}

              <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

              <div className={topBarSliderWrapClass()}>
                <span>X</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={selectedBlock.data.image.positionX ?? 50}
                  onChange={(e) => onUpdateSelectedImagePatch({ positionX: Number(e.target.value) })}
                  className={topBarSliderClass()}
                  title="Image horizontal position"
                />
              </div>

              <div className={topBarSliderWrapClass()}>
                <span>Y</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={selectedBlock.data.image.positionY ?? 50}
                  onChange={(e) => onUpdateSelectedImagePatch({ positionY: Number(e.target.value) })}
                  className={topBarSliderClass()}
                  title="Image vertical position"
                />
              </div>

              <div className={topBarSliderWrapClass()}>
                <span>Zoom</span>
                <input
                  type="range"
                  min={50}
                  max={300}
                  value={Math.round((selectedBlock.data.image.zoom ?? 1) * 100)}
                  onChange={(e) => onUpdateSelectedImagePatch({ zoom: Number(e.target.value) / 100 })}
                  className={topBarSliderClass()}
                  title="Image zoom"
                />
              </div>

              <div className={topBarSliderWrapClass()}>
                <span>Rotate</span>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  value={selectedBlock.data.image.rotation ?? 0}
                  onChange={(e) => onUpdateSelectedImagePatch({ rotation: Number(e.target.value) })}
                  className={topBarSliderClass()}
                  title="Image rotation"
                />
              </div>
            </>
          ) : null}

          {showAppearanceControls ? (
            <>
              <div className="mx-2 h-8 w-px shrink-0 bg-white/15" />

              <input
                type="color"
                value={selectedAppearance.backgroundColor ?? "#ffffff"}
                onChange={(e) => onApplyAppearancePatch({ backgroundColor: e.target.value })}
                className={topBarColorClass(false)}
                title="Fill color"
              />

              <button
                type="button"
                className={topBarButtonClass(
                  !selectedAppearance.backgroundColor || selectedAppearance.backgroundColor === "transparent",
                )}
                onClick={() => onApplyAppearancePatch({ backgroundColor: "transparent" })}
                title="Transparent fill"
              >
            <Image
              src="/icons/transparent_fill_icon.png"
              alt="Transparent fill"
              width={32}
              height={32}
              className="pointer-events-none h-[32px] w-[32px] object-contain"
            />
              </button>

              <input
                type="color"
                value={selectedAppearance.borderColor ?? "#d1d5db"}
                onChange={(e) => onApplyAppearancePatch({ borderColor: e.target.value })}
                className={topBarColorClass(false)}
                title="Border color"
              />

              {showBorderWidthRadiusControls ? (
                <>
                  <div className={topBarSliderWrapClass()}>
                    <span>Border</span>
                    <input
                      type="range"
                      min={0}
                      max={30}
                      value={selectedAppearance.borderWidth ?? 0}
                      onChange={(e) => onApplyAppearancePatch({ borderWidth: Number(e.target.value) || 0 })}
                      className={topBarSliderClass()}
                      title="Border width"
                    />
                    <span>{selectedAppearance.borderWidth ?? 0}</span>
                  </div>

                  <div className={topBarSliderWrapClass()}>
                    <span>Radius</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={selectedAppearance.borderRadius ?? 0}
                      onChange={(e) => onApplyAppearancePatch({ borderRadius: Number(e.target.value) || 0 })}
                      className={topBarSliderClass()}
                      title="Corner radius"
                    />
                    <span>{selectedAppearance.borderRadius ?? 0}</span>
                  </div>
                </>
              ) : null}
            </>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className={topBarButtonClass(false, false, true)}
            onClick={onRemoveAllBlocks}
            title="Remove all blocks"
          >
            <Image
              src="/icons/remove_all_icon.png"
              alt="Remove All"
              width={32}
              height={32}
              className="pointer-events-none h-[32px] w-[32px] object-contain"
            />
          </button>

          <div className="mx-1 h-8 w-px shrink-0 bg-white/15" />

          <button
            type="button"
            className={topBarButtonClass(false)}
            onClick={onUploadPageBackgroundImage}
            title="Set page background image"
          >
            <Image
              src="/icons/add_background_image_icon.png"
              alt="Background Image"
              width={32}
              height={32}
              className="pointer-events-none h-[32px] w-[32px] object-contain"
            />
          </button>

          <button
            type="button"
            className={topBarButtonClass(backgroundImageDisabled, backgroundImageDisabled)}
            onClick={onClearPageBackgroundImage}
            disabled={backgroundImageDisabled}
            title="Clear page background image"
          >
            <Image
              src="/icons/remove_background_image_icon.png"
              alt="Clear Background Image"
              width={30}
              height={30}
              className="pointer-events-none h-[30px] w-[30px] object-contain"
            />
          </button>

          <select
            value={(draft as DraftWithPageExtras).pageBackgroundImageFit ?? "zoom"}
            onChange={(e) => onUpdatePageBackgroundImageFit(e.target.value as "clip" | "zoom" | "stretch")}
            className={topBarFieldClass("w-[120px]")}
            title="Page background fit"
          >
            <option value="clip">Clip</option>
            <option value="zoom">Zoom</option>
            <option value="stretch">Stretch</option>
          </select>

          <div className="mx-1 h-8 w-px shrink-0 bg-white/15" />

          <input
            type="color"
            value={resolvedPageColor}
            onChange={(e) => onSetPageColor(e.target.value)}
            className={topBarColorClass(false)}
            title="Page color"
          />

          <button
/*             type="button"
            className={topBarButtonClass(false, canvasZoom <= MIN_CANVAS_ZOOM)}
            onClick={onZoomOut}
            disabled={canvasZoom <= MIN_CANVAS_ZOOM}
            title="Zoom out canvas" */
          >
            <Image
              src="/icons/zoom_out_icon.png"
              alt="Zoom out"
              width={30}
              height={30}
              className="pointer-events-none h-[30px] w-[30px] object-contain"
            />
          </button>

          <button
/*             type="button"
            className={topBarButtonClass(false, canvasZoom >= MAX_CANVAS_ZOOM)}
            onClick={onZoomIn}
            disabled={canvasZoom >= MAX_CANVAS_ZOOM}
            title="Zoom in canvas"
          >
            + */
            
          >
            <Image
              src="/icons/zoom_in_icon.png"
              alt="Zoom in"
              width={30}
              height={30}
              className="pointer-events-none h-[30px] w-[30px] object-contain"
            />
          </button>

          <div className={infoPillClass()}>{canvasZoom}%</div>
        </div>
      </div>
    </div>
  );
}