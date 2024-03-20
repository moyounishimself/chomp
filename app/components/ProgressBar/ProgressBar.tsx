import classNames from "classnames";

type ProgressBarProps = {
  percentage: number;
  progressColor?: string;
  bgColor?: string;
  className?: string;
};

export function ProgressBar({
  percentage,
  progressColor,
  bgColor,
  className,
}: ProgressBarProps) {
  const percentageCapped = percentage > 100 ? 100 : percentage;
  return (
    <div
      className={classNames(
        "relative rounded-full h-3.5 bg-search-gray w-full overflow-hidden",
        className
      )}
      style={{ backgroundColor: bgColor }}
    >
      <div
        className="h-full bg-purple absolute top-0 l-0 w-full"
        style={{
          width: `${percentageCapped}%`,
          backgroundColor: progressColor,
        }}
      ></div>
    </div>
  );
}