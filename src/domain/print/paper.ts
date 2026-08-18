import type { PaperDimensions, PaperOrientation, PaperSize } from "./types";

const PAPER_SIZES: Record<PaperSize, { label: string; width: number; height: number }> = {
  a4: { label: "A4", width: 210, height: 297 },
  a3: { label: "A3", width: 297, height: 420 },
};

export const getPaperDimensions = (
  size: PaperSize,
  orientation: PaperOrientation,
): PaperDimensions => {
  const paper = PAPER_SIZES[size];
  const landscape = orientation === "landscape";
  return {
    label: `${paper.label} ${landscape ? "אופקי" : "אנכי"}`,
    width: landscape ? paper.height : paper.width,
    height: landscape ? paper.width : paper.height,
    size,
    orientation,
  };
};
