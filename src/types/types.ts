import {SVGProps} from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
  width?: number;
  height?: number;
  transform?: string;
};
