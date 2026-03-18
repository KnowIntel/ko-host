export function generateArcPath(
  width: number,
  height: number,
  curvature: number
): string {
  const midX = width / 2;
  const baseY = height / 2;

  const curveStrength = curvature * 2; // amplify

  const controlY = baseY - curveStrength;

  return `
    M 0 ${baseY}
    Q ${midX} ${controlY} ${width} ${baseY}
  `;
}