const BAR_WIDTHS = [
  52, 47, 42, 38, 34, 31, 28, 25, 22, 20, 18, 16, 15, 13, 12, 11, 10, 9, 8, 7, 6, 6, 5, 5, 4, 4, 3, 3, 3, 2,
];

function createBars() {
  let cursor = 0;

  return BAR_WIDTHS.map((width, i) => {
    const t = i / (BAR_WIDTHS.length - 1);
    const start = cursor;
    cursor += width;
    const presence = 0.34 + 0.66 * (1 - t) ** 0.5;
    const flicker = 0.92 + 0.08 * Math.sin(i * 2.399) ** 2;

    return {
      id: i,
      style: {
        left: `${start}px`,
        width: `${width}px`,
        '--line': ((0.18 + presence * 0.48) * flicker).toFixed(3),
        '--glow': ((0.02 + presence * 0.06) * flicker).toFixed(3),
        '--face': (0.1 + presence * 0.34).toFixed(3),
      },
    };
  });
}

const BARS = createBars();

function DepthSide({ className }) {
  return (
    <div className={className}>
      {BARS.map((bar) => (
        <span key={bar.id} className="depth-bar" style={bar.style} />
      ))}
    </div>
  );
}

export default function SiteBackdrop() {
  return (
    <div className="site-backdrop" aria-hidden="true">
      <DepthSide className="depth-side depth-side-left" />
      <DepthSide className="depth-side depth-side-right" />
    </div>
  );
}
