/* -------------------------------------------------------------------------- */
/* COMPATIBILITY LAYER */
/* -------------------------------------------------------------------------- */
/* This file now simply re-exports the new builder mutation modules.
   The editor can keep importing from editorUtils without breaking. */

export * from "@/components/builder/mutations/blockMutations";
export * from "@/components/builder/mutations/appearanceMutations";
export * from "@/components/builder/mutations/contentMutations";

/* -------------------------------------------------------------------------- */
/* FILE UTILITIES */
/* -------------------------------------------------------------------------- */

export function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function isFormFieldBlock(block: any) {
  return block?.type === "form_field";
}

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () =>
      reject(new Error(`Failed reading file: ${file.name}`));

    reader.readAsDataURL(file);
  });
}