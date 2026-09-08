"use client";

type AudioInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  uploadAudioToSelectedBlock: (
    blockId: string,
  ) => Promise<any> | void;

  openImagePicker: (
    options: any,
  ) => void;

  uploadBuilderImageFile: (
    file: File,
  ) => Promise<any>;

  inspectorCardClass:
    () => string;

  inspectorLabelClass:
    () => string;
};

export function AudioInspector({
  selectedBlock,
  updateSelectedBlock,

  uploadAudioToSelectedBlock,

  openImagePicker,
  uploadBuilderImageFile,

  inspectorCardClass,
  inspectorLabelClass,
}: AudioInspectorProps) {
  const data =
    selectedBlock.data as any;

  const displayMode =
    data.displayMode ??
    "player";

  const isImageButton =
    displayMode ===
    "image_button";

  function patchAudioData(
    patch:
      Record<string, any>,
  ) {
    updateSelectedBlock(
      (block: any) =>
        block.type !==
        "audio"
          ? block
          : {
              ...block,

              data: {
                ...block.data,
                ...patch,
              },
            },
    );
  }

  function setDisplayMode(
    nextMode:
      | "player"
      | "image_button",
  ) {
    /*
     * Image Button is intentionally a
     * one-action player.
     *
     * Autoplay, looping and native player
     * controls must all be disabled.
     */
    if (
      nextMode ===
      "image_button"
    ) {
      patchAudioData({
        displayMode:
          "image_button",

        autoplay:
          false,

        loop:
          false,

        showPlayer:
          false,
      });

      return;
    }

    patchAudioData({
      displayMode:
        "player",

      /*
       * Restore the normal player UI when
       * returning to Player mode.
       *
       * Autoplay and Repeat remain off until
       * the owner explicitly enables them.
       */
      autoplay:
        false,

      loop:
        false,

      showPlayer:
        true,
    });
  }

  return (
    <div
      id="inspector-audio"
      className={
        inspectorCardClass()
      }
    >
      <div
        className={
          inspectorLabelClass()
        }
      >
        Audio
      </div>

      {/* ============================================================ */}
      {/* AUDIO SOURCE */}
      {/* ============================================================ */}

      <div className="mt-4">
        <div
          className={
            inspectorLabelClass()
          }
        >
          Audio File
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
            onClick={() =>
              void uploadAudioToSelectedBlock(
                selectedBlock.id,
              )
            }
          >
            {data.audioUrl
              ? "Replace Audio"
              : "Browse Audio"}
          </button>

          {data.audioUrl ? (
            <button
              type="button"
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-red-200 bg-white px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              onClick={() =>
patchAudioData({
  audioUrl: "",
  audioStoragePath: "",
  audioMimeType: "",
  audioSizeBytes: 0,
})
              }
            >
              Remove Audio
            </button>
          ) : null}
        </div>
      </div>

      {/* ============================================================ */}
      {/* DISPLAY MODE */}
      {/* ============================================================ */}

      <div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
        <div
          className={
            inspectorLabelClass()
          }
        >
          Display Mode
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() =>
              setDisplayMode(
                "player",
              )
            }
            className={[
              "rounded-xl border px-3 py-2 text-sm font-medium transition",

              displayMode ===
              "player"
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100",
            ].join(" ")}
          >
            Player
          </button>

          <button
            type="button"
            onClick={() =>
              setDisplayMode(
                "image_button",
              )
            }
            className={[
              "rounded-xl border px-3 py-2 text-sm font-medium transition",

              isImageButton
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100",
            ].join(" ")}
          >
            Image Button
          </button>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-neutral-500">
          Image Button turns the entire Audio block into one clickable image.
          Clicking it plays the audio once from the beginning.
        </p>
      </div>

      {/* ============================================================ */}
      {/* STANDARD PLAYER SETTINGS */}
      {/* ============================================================ */}

      {!isImageButton ? (
        <>
          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
              <input
                type="checkbox"
                checked={
                  data.loop ===
                  true
                }
                onChange={(e) =>
                  patchAudioData({
                    loop:
                      e.target
                        .checked,
                  })
                }
              />

              Repeat
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
              <input
                type="checkbox"
                checked={
                  data.autoplay ===
                  true
                }
                onChange={(e) =>
                  patchAudioData({
                    autoplay:
                      e.target
                        .checked,
                  })
                }
              />

              Autoplay
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
              <input
                type="checkbox"
                checked={
                  data.showPlayer !==
                  false
                }
                onChange={(e) =>
                  patchAudioData({
                    showPlayer:
                      e.target
                        .checked,
                  })
                }
              />

              Show Player Controls
            </label>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-neutral-500">
            Autoplay may be blocked by browsers, especially on mobile, until
            the visitor taps the page.
          </p>
        </>
      ) : null}

      {/* ============================================================ */}
      {/* IMAGE BUTTON */}
      {/* ============================================================ */}

      {isImageButton ? (
        <div className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
          <div
            className={
              inspectorLabelClass()
            }
          >
            Button Image
          </div>

          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            This image becomes the entire visible face of the Audio block.
          </p>

          {data.buttonImageUrl ? (
            <div className="mt-3 flex min-h-32 w-full items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-white p-2">
              <img
                src={
                  data.buttonImageUrl
                }
                alt="Audio button preview"
                className="max-h-44 max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="mt-3 flex min-h-28 items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white px-4 text-center text-sm text-neutral-500">
              Add an image to create the audio button.
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                openImagePicker({
                  multiple:
                    false,

                  onSelect:
                    async (
                      files:
                        File[],
                    ) => {
                      const file =
                        files[0];

                      if (!file) {
                        return;
                      }

                      const uploaded =
                        await uploadBuilderImageFile(
                          file,
                        );

                      patchAudioData({
                        buttonImageUrl:
                          uploaded.url,
                      });
                    },
                })
              }
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:border-neutral-900"
            >
              {data.buttonImageUrl
                ? "Replace Image"
                : "Add Image"}
            </button>

            {data.buttonImageUrl ? (
              <button
                type="button"
                onClick={() =>
patchAudioData({
  buttonImageUrl: "",
  buttonImageStoragePath: "",
  buttonImageMimeType: "",
  buttonImageSizeBytes: 0,
})
                }
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                Remove Image
              </button>
            ) : null}
          </div>

          {/* ======================================================== */}
          {/* IMAGE FIT */}
          {/* ======================================================== */}

          <div className="mt-4">
            <div
              className={
                inspectorLabelClass()
              }
            >
              Image Fit
            </div>

            <select
              value={
                data.buttonImageFit ??
                "stretch"
              }
              onChange={(e) =>
                patchAudioData({
                  buttonImageFit:
                    e.target
                      .value,
                })
              }
              className="mt-2 h-10 w-full rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none focus:border-neutral-900"
            >
              <option value="stretch">
                Stretch to Block
              </option>

              <option value="cover">
                Fill / Crop
              </option>

              <option value="contain">
                Fit Entire Image
              </option>
            </select>
          </div>

          <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-3 text-xs leading-relaxed text-neutral-600">
            In Image Button mode, Autoplay, Repeat, and Player Controls are
            disabled. The visitor can only click the image to play the audio
            once. After playback finishes, the image can be clicked again to
            replay it.
          </div>
        </div>
      ) : null}
    </div>
  );
}