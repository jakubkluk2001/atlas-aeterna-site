type Point = [number, number];

type Ridge = {
  heights: Point[];
  depth: number;
  surface: [string, string, string];
  mineral: string;
  highlight: string;
  gilded?: boolean;
};

const ridges: Ridge[] = [
  {
    heights: [[-.2, .91], [.02, .87], [.23, .79], [.37, .72], [.53, .61], [.63, .51], [.70, .39], [.75, .33], [.81, .37], [.87, .45], [.94, .41], [1.02, .30], [1.13, .34], [1.24, .40]],
    depth: .11,
    surface: ["#172d26", "#335046", "#263e32"],
    mineral: "#1f362c",
    highlight: "#7e9b72",
  },
  {
    heights: [[-.18, .93], [.01, .83], [.13, .73], [.26, .66], [.38, .69], [.48, .72], [.56, .67], [.65, .55], [.71, .48], [.78, .49], [.88, .59], [.96, .55], [1.08, .46], [1.21, .49]],
    depth: .12,
    surface: ["#1a342a", "#3d5b48", "#2e4938"],
    mineral: "#223e2f",
    highlight: "#a2aa77",
  },
  {
    heights: [[-.14, .98], [-.02, .89], [.13, .84], [.27, .85], [.39, .89], [.48, .86], [.59, .72], [.68, .67], [.76, .71], [.86, .79], [.94, .72], [1.04, .62], [1.20, .65]],
    depth: .125,
    surface: ["#193329", "#3a5f4a", "#284737"],
    mineral: "#1b382b",
    highlight: "#a8b384",
  },
  {
    heights: [[-.15, 1.02], [.00, .97], [.13, .96], [.25, .94], [.36, .86], [.46, .83], [.55, .88], [.64, .93], [.75, .91], [.82, .77], [.87, .62], [.91, .52], [.955, .55], [1.02, .57], [1.11, .56], [1.23, .60]],
    depth: .18,
    surface: ["#10271e", "#305440", "#2c4e3d"],
    mineral: "#132f24",
    highlight: "#b3b68b",
    gilded: true,
  },
];

function project([x, y]: Point, width: number, height: number, mobile: boolean): Point {
  return mobile ? [(x - .35) * width * 1.32, (y * .77 + .24) * height] : [x * width, y * height];
}

function curve(points: Point[], xShift = 0, yShift = 0) {
  const path = new Path2D();
  const first = points[0];
  path.moveTo(first[0] + xShift, first[1] + yShift);
  for (let i = 0; i < points.length - 1; i += 1) {
    const previous = points[Math.max(0, i - 1)];
    const current = points[i];
    const next = points[i + 1];
    const after = points[Math.min(points.length - 1, i + 2)];
    path.bezierCurveTo(
      current[0] + (next[0] - previous[0]) / 6 + xShift,
      current[1] + (next[1] - previous[1]) / 6 + yShift,
      next[0] - (after[0] - current[0]) / 6 + xShift,
      next[1] - (after[1] - current[1]) / 6 + yShift,
      next[0] + xShift,
      next[1] + yShift,
    );
  }
  return path;
}

function fillRegion(points: Point[], width: number, height: number, yShift: number) {
  const path = curve(points, -yShift * .09, yShift);
  path.lineTo(width * 1.4, height * 1.4);
  path.lineTo(-width * .9, height * 1.4);
  path.closePath();
  return path;
}

function ridge(
  ctx: CanvasRenderingContext2D,
  form: Ridge,
  width: number,
  height: number,
  mobile: boolean,
) {
  const points = form.heights.map(sample => project(sample, width, height, mobile));
  const top = fillRegion(points, width, height, 0);
  const offset = form.depth * height * (mobile ? .56 : .8);
  const gradient = ctx.createLinearGradient(width * .32, height * .25, width * .96, height * .98);
  gradient.addColorStop(0, form.surface[0]);
  gradient.addColorStop(.58, form.surface[1]);
  gradient.addColorStop(1, form.surface[2]);

  ctx.save();
  ctx.shadowColor = "#030d098c";
  ctx.shadowBlur = Math.max(12, height * .027);
  ctx.shadowOffsetY = -height * .006;
  ctx.fillStyle = gradient;
  ctx.fill(top);
  ctx.restore();

  ctx.save();
  ctx.clip(top);
  const strata = ctx.createLinearGradient(width * .2, 0, width, 0);
  strata.addColorStop(0, "#98ad7b00");
  strata.addColorStop(.49, `${form.highlight}46`);
  strata.addColorStop(.81, `${form.highlight}82`);
  strata.addColorStop(1, `${form.highlight}28`);
  for (let layer = 1; layer <= 6; layer += 1) {
    const shift = offset * ((layer / 6) ** 1.18);
    ctx.globalAlpha = .2 + layer * .073;
    ctx.fillStyle = form.mineral;
    ctx.fill(fillRegion(points, width, height, shift));
    ctx.strokeStyle = strata;
    ctx.lineWidth = layer === 3 ? 1.15 : .66;
    ctx.stroke(curve(points, -shift * .09, shift));
  }
  ctx.restore();

  const rim = ctx.createLinearGradient(width * .1, 0, width, 0);
  rim.addColorStop(0, `${form.highlight}09`);
  rim.addColorStop(.35, `${form.highlight}22`);
  rim.addColorStop(.74, `${form.highlight}a8`);
  rim.addColorStop(.92, `${form.highlight}68`);
  rim.addColorStop(1, `${form.highlight}3d`);
  ctx.strokeStyle = rim;
  ctx.lineWidth = mobile ? 1 : 1.25;
  ctx.stroke(curve(points));

  if (form.gilded) {
    const reflection = ctx.createLinearGradient(width * .76, 0, width, 0);
    reflection.addColorStop(0, "#d7b56e00");
    reflection.addColorStop(.61, "#d7b56e91");
    reflection.addColorStop(1, "#d7b56e12");
    ctx.strokeStyle = reflection;
    ctx.lineWidth = 1.35;
    ctx.stroke(curve(points));
  }

  ctx.save();
  ctx.clip(top);
  const light = ctx.createRadialGradient(width * .79, height * .37, 0, width * .79, height * .37, width * .39);
  light.addColorStop(0, "#bcd5a333");
  light.addColorStop(.52, "#b5cf9320");
  light.addColorStop(1, "#98b87b00");
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function surface(canvas: HTMLCanvasElement, width: number, height: number) {
  const density = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(width * density);
  canvas.height = Math.round(height * density);
  const context = canvas.getContext("2d");
  context?.scale(density, density);
  return context;
}

export function renderRelief(back: HTMLCanvasElement, front: HTMLCanvasElement, width: number, height: number) {
  if (!(width && height)) return;
  const terrain = surface(back, width, height);
  const foreground = surface(front, width, height);
  if (!(terrain && foreground)) return;

  const mobile = width < 680;
  ridges.slice(0, -1).forEach(form => ridge(terrain, form, width, height, mobile));
  ridge(foreground, ridges[ridges.length - 1], width, height, mobile);
}
