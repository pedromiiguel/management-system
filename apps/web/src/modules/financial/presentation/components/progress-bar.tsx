type TProgressBarProps = { percent: number; height?: number };

export function ProgressBar({ percent, height = 10 }: TProgressBarProps) {
  const width = `${Math.min(100, Math.max(0, percent))}%`;
  return (
    <div className="s-progress" style={{ height }}>
      <div className="s-progress-fill" style={{ width }} />
    </div>
  );
}
