"use client";

/**
 * Puzzle inspector section
 * Extracted from DesignLayoutEditor.
 *
 * DesignLayoutEditor remains the middleman and only renders this when:
 * selectedBlock?.type === "puzzle"
 */
type PuzzleInspectorProps = {
  selectedBlock: any;
  updateSelectedBlock: any;

  uploadPuzzleImageToSelectedBlock: (blockId: string) => Promise<any> | void;

  inspectorCardClass: () => string;
  inspectorLabelClass: () => string;
  inspectorInputClass: () => string;
};

export function PuzzleInspector({
  selectedBlock,
  updateSelectedBlock,
  uploadPuzzleImageToSelectedBlock,
  inspectorCardClass,
  inspectorLabelClass,
  inspectorInputClass,
}: PuzzleInspectorProps) {
  return (
    <div className={inspectorCardClass()}>
      {/* Puzzle */}
    <div className={inspectorLabelClass()}>Puzzle</div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Image URL</div>
      <input
        type="text"
        value={(selectedBlock.data as any).imageUrl ?? ""}
        onChange={(e) => {
          const nextUrl = e.target.value;

          updateSelectedBlock((block: any) =>
            block.type !== "puzzle"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    imageUrl: nextUrl,
                    imageAlt: block.data.imageAlt || "Puzzle image",
                    generatedAt: "",
                    pieces: [],
                  },
                },
          );
        }}
        className={inspectorInputClass()}
        placeholder="/designs/artifacts/example.png"
      />

      <button
        type="button"
        className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-700 hover:bg-neutral-50"
        onClick={() => uploadPuzzleImageToSelectedBlock(selectedBlock.id)}
      >
        Browse Puzzle Image
      </button>
      <label className="mt-3 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-800">
  <input
    type="checkbox"
    checked={(selectedBlock.data as any).displayPuzzleImage !== false}
    onChange={(e) =>
      updateSelectedBlock((block: any) =>
        block.type !== "puzzle"
          ? block
          : {
              ...block,
              data: {
                ...block.data,
                displayPuzzleImage: e.target.checked,
              },
            },
      )
    }
  />
  Display Puzzle Image
</label>
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Puzzle Piece Count</div>
      <input
        type="number"
        min={10}
        max={1000}
        value={(selectedBlock.data as any).pieceCount ?? 100}
        onChange={(e) => {
          const nextCount = Math.max(
            10,
            Math.min(1000, Number(e.target.value) || 100),
          );

          updateSelectedBlock((block: any) =>
            block.type !== "puzzle"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    pieceCount: nextCount,
                    generatedAt: "",
                    pieces: [],
                  },
                },
          );
        }}
        className={inspectorInputClass()}
      />
    </div>

    <div className="mt-4">
      <div className={inspectorLabelClass()}>Sort Level</div>
      <select
        value={(selectedBlock.data as any).sortLevel ?? "intermediate"}
        onChange={(e) => {
          const nextSortLevel = e.target.value as
            | "beginner"
            | "intermediate"
            | "advanced";

          updateSelectedBlock((block: any) =>
            block.type !== "puzzle"
              ? block
              : {
                  ...block,
                  data: {
                    ...block.data,
                    sortLevel: nextSortLevel,
                    generatedAt: "",
                    pieces: [],
                  },
                },
          );
        }}
        className={inspectorInputClass()}
      >
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>

      <p className="mt-2 text-xs leading-5 text-neutral-500">
        Changing sort level clears generated pieces. Press Reset Puzzle again to
        rebuild the puzzle.
      </p>
    </div>

    <button
      type="button"
      disabled={
        !((selectedBlock.data as any).imageUrl ?? "") ||
        !((selectedBlock.data as any).pieceCount ?? 0)
      }
      onClick={() => {
        updateSelectedBlock((block: any) => {
          if (block.type !== "puzzle") return block;

          const pieceCount = block.data.pieceCount || 100;

          let rows = 1;
          let cols = pieceCount;

          for (
            let possibleRows = 1;
            possibleRows <= Math.sqrt(pieceCount);
            possibleRows++
          ) {
            if (pieceCount % possibleRows === 0) {
              rows = possibleRows;
              cols = pieceCount / possibleRows;
            }
          }

          const pieceWidth = 100 / cols;
          const pieceHeight = 100 / rows;
          const pieces: any[] = [];
          const generatedAt = new Date().toISOString();

          let index = 0;

          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              if (index >= pieceCount) break;

              const isEdge =
                r === 0 || c === 0 || r === rows - 1 || c === cols - 1;

              const isCorner =
                (r === 0 || r === rows - 1) &&
                (c === 0 || c === cols - 1);

              let currentX = 66 + Math.random() * 28;
              let currentY = 12 + Math.random() * 76;

              if (block.data.sortLevel === "beginner") {
                currentX = Math.max(
                  0,
                  Math.min(100, 6 + c * 3 + Math.random() * 10),
                );
                currentY = Math.max(
                  0,
                  Math.min(100, 12 + r * 3 + Math.random() * 68),
                );
              }

              if (
                block.data.sortLevel === "intermediate" &&
                isEdge &&
                (block.data as any).autoSortEdges !== false
              ) {
                currentX = 3 + Math.random() * 22;
                currentY = 12 + Math.random() * 76;
              }

              if (isCorner && (block.data as any).autoSortCorners !== false) {
                currentX = 3 + Math.random() * 18;
                currentY = 6 + Math.random() * 14;
              }

              pieces.push({
                id: `${block.id}_piece_${generatedAt}_${index}`,
                index,
                row: r,
                col: c,
                correctX: c * pieceWidth,
                correctY: r * pieceHeight,
                currentX,
                currentY,
                widthPercent: pieceWidth,
                heightPercent: pieceHeight,
                isEdge,
                isCorner,
                isPlaced: false,
              });

              index++;
            }
          }

          return {
            ...block,
            data: {
              ...block.data,
              generatedAt,
              pieces,
            },
          };
        });
      }}
      className="mt-4 h-11 w-full rounded-xl bg-neutral-900 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
    >
      Reset Puzzle
    </button>

    <button
      type="button"
      disabled={((selectedBlock.data as any).pieces ?? []).length === 0}
      onClick={() => {
        updateSelectedBlock((block: any) => {
          if (block.type !== "puzzle") return block;

          return {
            ...block,
            data: {
              ...block.data,
              generatedAt: new Date().toISOString(),
              pieces: (block.data.pieces ?? []).map((piece: any) => ({
                ...piece,
                currentX: piece.isCorner
                  ? 3 + Math.random() * 18
                  : piece.isEdge && (block.data as any).autoSortEdges !== false
                    ? 3 + Math.random() * 22
                    : 66 + Math.random() * 28,
                currentY: piece.isCorner
                  ? 6 + Math.random() * 14
                  : 12 + Math.random() * 76,
                isPlaced: false,
              })),
            },
          };
        });
      }}
      className="mt-3 h-11 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400"
    >
      Shuffle Pieces
    </button>

    <p className="mt-2 text-xs leading-5 text-neutral-500">
      Reset rebuilds the puzzle pieces. Shuffle only randomizes current piece
      positions.
    </p>

    <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-xs leading-5 text-neutral-600">
      {((selectedBlock.data as any).pieces ?? []).length > 0 ? (
        <>
          Generated{" "}
          <span className="font-semibold text-neutral-900">
            {((selectedBlock.data as any).pieces ?? []).length}
          </span>{" "}
          puzzle pieces.
        </>
      ) : (
        <>No pieces generated yet.</>
      )}
    </div>
    </div>
  );
}