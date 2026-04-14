import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function Container({ children, className = "" }: Props) {
  return (
    <div
      className={`
        w-full
        max-w-[1200px]
        mx-auto
        px-4
        overflow-x-hidden
        ${className}
      `}
      style={{
        WebkitOverflowScrolling: "touch",
      }}
    >
      {children}
    </div>
  );
}

export default Container;