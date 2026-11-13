type Wave = {
  heights: number[];
  colors: [string, string, string];
  highlights: number;
};

const waves: Wave[] = [
  {
    heights: [.79, .74, .77, .71, .59, .56, .61, .65, .55, .49, .57, .64],
    colors: ["#263e53", "#35546b", "#102130"],
    highlights: 2,
  },
  {
    heights: [.89, .86, .80, .69, .68, .74, .78, .69, .58, .58, .65, .70],
    colors: ["#203b50", "#41667c", "#0f2030"],
    highlights: 3,
  },
  {
    heights: [.88, .80, .82, .92, .92, .80, .72, .74, .81, .78, .69, .68],
    colors: ["#132d42", "#2d5369", "#0b1b2a"],
    highlights: 3,
  },
  {
    heights: [1.02, .99, .97, .95, .92, .95, .98, .91, .76, .70, .76, .86],
    colors: ["#122b3e", "#3d6578", "#081d2d"],
    highlights: 2,
  },
];

function crest(wave: Wave, width: number, height: number, depth = 0) {
  const path = new Path2D();
  const mobile = width < 600;
  const span = width * (mobile ? 1.48 : 1.16);
  const step = span / (wave.heights.length - 1);
  const start = (width - span) * (mobile ? .61 : .5);
  const heights = wave.heights.map(value => (mobile ? .25 + value * .76 : value) * height + depth);
  path.moveTo(start, heights[0]);

  for (let i = 0; i < heights.length - 1; i += 1) {
    const before = heights[Math.max(0, i - 1)];
    const current = heights[i];
    const next = heights[i + 1];
    const after = heights[Math.min(i + 2, heights.length - 1)];
    const x = start + step * i;
    path.bezierCurveTo(x + step / 3, current + (next - before) / 6,
      x + 2 * step / 3, next - (after - current) / 6, x + step, next);
  }
  return { path, start, end: start + span };
}

function paintWave(ctx: CanvasRenderingContext2D, wave: Wave, width: number, height: number) {
  const { path, start, end } = crest(wave, width, height);
  const body = new Path2D(path);
  body.lineTo(end, height + 20);
  body.lineTo(start, height + 20);
  body.closePath();

  const water = ctx.createLinearGradient(width * .54, height * .45, width * .47, height);
  water.addColorStop(0, wave.colors[0]);
  water.addColorStop(.4, wave.colors[1]);
  water.addColorStop(1, wave.colors[2]);
  ctx.save();
  ctx.fillStyle = water;
  ctx.shadowColor = "#07101bb3";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = -4;
  ctx.fill(body);
  ctx.restore();

  ctx.save();
  ctx.clip(body);
  const reflection = ctx.createRadialGradient(width * .58, height * .57, 0, width * .58, height * .57, width * .45);
  reflection.addColorStop(0, "#b9d6e232");
  reflection.addColorStop(.48, "#97c0d212");
  reflection.addColorStop(1, "#97c0d200");
  ctx.fillStyle = reflection;
  ctx.fillRect(0, 0, width, height);

  const rim = ctx.createLinearGradient(0, 0, width, 0);
  rim.addColorStop(0, "#a9cddb04");
  rim.addColorStop(.18, "#a9cddb2d");
  rim.addColorStop(.37, "#d8eaf036");
  rim.addColorStop(.5, "#d8eaf015");
  rim.addColorStop(.73, "#d8eef281");
  rim.addColorStop(.91, "#b2d0dc37");
  rim.addColorStop(1, "#a9cddb0b");
  ctx.strokeStyle = rim;
  ctx.lineWidth = 1.4;
  ctx.stroke(path);
  for (let i = 1; i <= wave.highlights; i += 1) {
    ctx.globalAlpha = .61 - i * .12;
    ctx.lineWidth = .75;
    ctx.stroke(crest(wave, width, height, (i * i + i + 2) * height * .0018).path);
  }
  ctx.restore();
}

export function renderOpenOcean(back: HTMLCanvasElement, front: HTMLCanvasElement, width: number, height: number) {
  if (width === 0 || height === 0) return;
  const density = Math.min(2, window.devicePixelRatio || 1);
  for (const canvas of [back, front]) {
    canvas.width = Math.round(width * density);
    canvas.height = Math.round(height * density);
    const context = canvas.getContext("2d");
    if (!context) continue;
    context.scale(density, density);
    const layers = canvas === back ? waves.slice(0, -1) : waves.slice(-1);
    for (const wave of layers) paintWave(context, wave, width, height);
  }
}
