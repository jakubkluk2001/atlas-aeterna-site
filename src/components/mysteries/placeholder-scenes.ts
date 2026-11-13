export type PlaceholderScene = "archive" | "ice" | "desert" | "twilight";
type Painter = (ctx: CanvasRenderingContext2D, width: number, height: number) => void;

function wash(ctx: CanvasRenderingContext2D, width: number, height: number, top: string, bottom: string) {
  const color = ctx.createLinearGradient(width * .64, height * .38, width * .45, height);
  color.addColorStop(0, top);
  color.addColorStop(1, bottom);
  return color;
}

function fillFromEdge(ctx: CanvasRenderingContext2D, edge: Path2D, width: number, height: number, fill: CanvasGradient, rim: string) {
  const body = new Path2D(edge);
  body.lineTo(width, height + 2);
  body.lineTo(0, height + 2);
  body.closePath();
  ctx.fillStyle = fill;
  ctx.fill(body);
  ctx.strokeStyle = rim;
  ctx.lineWidth = 1;
  ctx.stroke(edge);
}

function paintDesert(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cliff = new Path2D();
  cliff.moveTo(0, h * .88);
  cliff.lineTo(w * .45, h * .82);
  cliff.lineTo(w * .55, h * .76);
  cliff.lineTo(w * .62, h * .76);
  cliff.lineTo(w * .75, h * .59);
  cliff.lineTo(w * .80, h * .57);
  cliff.lineTo(w * .89, h * .61);
  cliff.lineTo(w * .93, h * .68);
  cliff.lineTo(w, h * .66);
  fillFromEdge(ctx, cliff, w, h, wash(ctx, w, h, "#a76945", "#513329"), "#dcac7682");

  const dune = new Path2D();
  dune.moveTo(0, h * .86);
  dune.bezierCurveTo(w * .24, h * .89, w * .39, h * .68, w * .54, h * .71);
  dune.bezierCurveTo(w * .73, h * .75, w * .73, h * .94, w, h * .83);
  fillFromEdge(ctx, dune, w, h, wash(ctx, w, h, "#d29867", "#684031"), "#e9b7819c");

  const foreground = new Path2D();
  foreground.moveTo(0, h * .95);
  foreground.bezierCurveTo(w * .27, h * .86, w * .42, h * 1.02, w * .65, h * .90);
  foreground.bezierCurveTo(w * .81, h * .82, w * .90, h * .78, w, h * .81);
  fillFromEdge(ctx, foreground, w, h, wash(ctx, w, h, "#e0a873", "#76432e"), "#f0bd8cab");
}

function paintIce(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const ridge = new Path2D();
  ridge.moveTo(0, h * .91);
  for (const [x, y] of [[.16, .84], [.28, .86], [.41, .73], [.50, .76], [.65, .67], [.78, .53], [.88, .59], [.93, .68], [1, .62]]) {
    ridge.lineTo(x * w, y * h);
  }
  fillFromEdge(ctx, ridge, w, h, wash(ctx, w, h, "#a3c8d6", "#193647"), "#d7f3faaf");

  const faces = [
    { points: [[.28, .86], [.41, .73], [.50, .76], [.45, .93]], color: "#456d83" },
    { points: [[.50, .76], [.65, .67], [.78, .53], [.71, .86], [.61, .93]], color: "#709bb0" },
    { points: [[.78, .53], [.88, .59], [.93, .68], [.85, .90], [.71, .86]], color: "#30546c" },
    { points: [[.85, .90], [.93, .68], [1, .62], [1, .92]], color: "#648ca1" },
  ];
  for (const face of faces) {
    ctx.beginPath();
    for (const [x, y] of face.points) ctx.lineTo(x * w, y * h);
    ctx.closePath();
    ctx.fillStyle = face.color;
    ctx.fill();
  }

  const shelf = new Path2D();
  shelf.moveTo(0, h * .98);
  shelf.lineTo(w * .15, h * .90);
  shelf.lineTo(w * .34, h * .94);
  shelf.lineTo(w * .46, h * .87);
  shelf.lineTo(w * .68, h * .93);
  shelf.lineTo(w * .86, h * .85);
  shelf.lineTo(w, h * .87);
  fillFromEdge(ctx, shelf, w, h, wash(ctx, w, h, "#8eafc1", "#315267"), "#b8dcebbc");
}

function paintTwilight(ctx: CanvasRenderingContext2D, w: number, h: number) {
  for (const [level, offset, top, bottom] of [
    [.73, 0, "#665471", "#30273c"], [.83, 1.6, "#493b5a", "#2b2238"], [.94, .7, "#382d48", "#201b2b"],
  ] as const) {
    const edge = new Path2D();
    for (let i = 0; i <= 64; i += 1) {
      const x = i / 64;
      const drift = Math.sin(x * 7 + offset) * .065 + Math.sin(x * 16 - offset) * .027;
      const canopy = Math.sin(i * 7.3) * .007 + Math.sin(i * 16.2) * .005;
      const y = (level + drift + canopy) * h;
      if (i === 0) edge.moveTo(0, y);
      else edge.lineTo(x * w, y);
    }
    fillFromEdge(ctx, edge, w, h, wash(ctx, w, h, top, bottom), "#d0abd026");
    ctx.save();
    ctx.translate(w * (.72 - offset * .17), h * (level + .045));
    ctx.scale(w * .58, h * .105);
    const fog = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    fog.addColorStop(0, "#d5c4e44f");
    fog.addColorStop(.5, "#c3abd52a");
    fog.addColorStop(1, "#c3abd500");
    ctx.fillStyle = fog;
    ctx.fillRect(-1, -1, 2, 2);
    ctx.restore();
  }
}

function paintArchive(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const span = Math.max(w * .79, h * .58);
  const depth = h * .38;
  ctx.save();
  ctx.translate(w * .51, h * .80);
  ctx.rotate(-.13);
  for (let i = 3; i >= 0; i -= 1) {
    const x = -span * .48 + i * 7;
    const y = i * 8;
    ctx.beginPath();
    ctx.roundRect(x, y, span, depth, 8);
    ctx.fillStyle = i % 2 ? "#694b33" : "#8c6947";
    ctx.fill();
    ctx.strokeStyle = "#c5a17a7a";
    ctx.stroke();
  }
  const closedCover = ctx.createLinearGradient(0, 0, 0, depth);
  closedCover.addColorStop(0, "#816145");
  closedCover.addColorStop(.4, "#5c402e");
  closedCover.addColorStop(1, "#31241c");
  ctx.beginPath();
  ctx.roundRect(-span * .49, -h * .06, span, depth, 9);
  ctx.fillStyle = closedCover;
  ctx.fill();
  ctx.strokeStyle = "#d4ad8094";
  ctx.stroke();
  for (const inset of [11, 17]) {
    ctx.beginPath();
    ctx.roundRect(-span * .49 + inset, -h * .06 + inset, span - inset * 2, depth - inset * 2, 8);
    ctx.strokeStyle = "#e2c19868";
    ctx.stroke();
  }
  for (const radius of [.08, .105, .13]) {
    ctx.beginPath();
    ctx.ellipse(span * .1, depth * .29, span * radius, depth * radius * 1.3, 0, 0, 2 * Math.PI);
    ctx.stroke();
  }
  ctx.restore();
}

function render(paint: Painter) {
  return (back: HTMLCanvasElement, front: HTMLCanvasElement, width: number, height: number) => {
    if (!width || !height) return;
    const density = Math.min(2, window.devicePixelRatio || 1);
    for (const canvas of [back, front]) {
      canvas.width = Math.round(width * density);
      canvas.height = Math.round(height * density);
    }
    const ctx = back.getContext("2d");
    if (!ctx) return;
    ctx.scale(density, density);
    paint(ctx, width, height);
  };
}

export const placeholderScenes: Record<PlaceholderScene, ReturnType<typeof render>> = {
  archive: render(paintArchive),
  desert: render(paintDesert),
  ice: render(paintIce),
  twilight: render(paintTwilight),
};
