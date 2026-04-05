// \components\builder\mutations\blockMutations.ts
import type {
  BuilderBlockType,
  MicrositeBlock,
  ShapeBlock,
  ShapeType,
} from "@/lib/templates/builder";

import { createBlock } from "@/lib/templates/builder";

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/* -------------------------------------------------------------------------- */
/* BLOCK CREATION */
/* -------------------------------------------------------------------------- */

export function createBlockFromType(
  type: BuilderBlockType,
): MicrositeBlock | null {
  try {
    return createBlock(type);
  } catch {
    return null;
  }
}

export function createDefaultShapeBlock(
  shapeType: ShapeType = "rectangle",
): ShapeBlock {
  const block = createBlock("shape") as ShapeBlock;

  return {
    ...block,
    data: {
      shapeType,
    },
  };
}

/* -------------------------------------------------------------------------- */
/* BLOCK LIST OPERATIONS */
/* -------------------------------------------------------------------------- */

export function addBlockTypeToDraft(
  blocks: MicrositeBlock[],
  type: BuilderBlockType,
) {
  const block = createBlockFromType(type);

  return block ? [...blocks, block] : blocks;
}

export function addShapeBlockToDraft(
  blocks: MicrositeBlock[],
  shapeType: ShapeType,
) {
  return [...blocks, createDefaultShapeBlock(shapeType)];
}

export function removeBlockFromDraft(
  blocks: MicrositeBlock[],
  blockId: string,
) {
  return blocks.filter((b) => b.id !== blockId);
}

/* -------------------------------------------------------------------------- */
/* SHAPE */
/* -------------------------------------------------------------------------- */

export function updateShapeType(
  blocks: MicrositeBlock[],
  blockId: string,
  shapeType: ShapeType,
) {
  return blocks.map((block) =>
    block.type === "shape" && block.id === blockId
      ? {
          ...block,
          data: {
            ...block.data,
            shapeType,
          },
        }
      : block,
  );
}