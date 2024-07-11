import { ICON_DEFAULT_WIDTH_HEIGHT, IconProps } from ".";

export function PencilEditIcon({
  fill = "#fff",
  width = ICON_DEFAULT_WIDTH_HEIGHT,
  height = ICON_DEFAULT_WIDTH_HEIGHT,
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 12 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 12.4674V9.63407L8.8 0.850741C8.93333 0.728518 9.08066 0.634074 9.242 0.567407C9.40333 0.500741 9.57266 0.467407 9.75 0.467407C9.92777 0.467407 10.1 0.500741 10.2667 0.567407C10.4333 0.634074 10.5778 0.734074 10.7 0.867407L11.6167 1.80074C11.75 1.92296 11.8473 2.06741 11.9087 2.23407C11.97 2.40074 12.0004 2.56741 12 2.73407C12 2.91185 11.9696 3.08141 11.9087 3.24274C11.8478 3.40407 11.7504 3.55118 11.6167 3.68407L2.83333 12.4674H0ZM9.73333 3.66741L10.6667 2.73407L9.73333 1.80074L8.8 2.73407L9.73333 3.66741Z"
        fill="#999999"
      />
    </svg>
  );
}