import React, { lazy, Suspense } from "react";
import { LucideProps } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";

const fallback = <div style={{ background: "#ddd", width: 24, height: 24 }} />;

interface IconProps extends Omit<LucideProps, "ref"> {
  name: keyof typeof dynamicIconImports;
}

const iconCache: Partial<Record<keyof typeof dynamicIconImports, React.LazyExoticComponent<React.ComponentType<LucideProps>>>> = {};

function getIcon(name: keyof typeof dynamicIconImports) {
  if (!iconCache[name]) {
    iconCache[name] = lazy(dynamicIconImports[name]);
  }
  return iconCache[name]!;
}

const Icon = ({ name, ...props }: IconProps) => {
  return (
    <Suspense fallback={fallback}>
      {React.createElement(getIcon(name), props)}
    </Suspense>
  );
};

export default Icon;
