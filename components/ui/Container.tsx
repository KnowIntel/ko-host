import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
};

export function Container({
  children,
  className = "",
  fullWidth = false,
}: Props) {
  return (
    <div
      className={[
        "w-full overflow-x-hidden",
        fullWidth ? "max-w-none px-0" : "max-w-[1200px] mx-auto px-4",
        className,
      ].join(" ")}
      style={{
        WebkitOverflowScrolling: "touch",
      }}
    >
      {children}
    </div>
  );
}

export default Container;