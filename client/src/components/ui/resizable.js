"use client";

import * as React from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { GripVertical } from "lucide-react";
import { cn } from "../../lib/utils";

const ResizablePanelGroup = React.forwardRef(({ className, ...props }, ref) => (
  <PanelGroup
    ref={ref}
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className,
    )}
    {...props}
  />
));
ResizablePanelGroup.displayName = "ResizablePanelGroup";

const ResizablePanel = React.forwardRef(({ className, ...props }, ref) => (
  <Panel
    ref={ref}
    className={cn("relative", className)}
    {...props}
  />
));
ResizablePanel.displayName = "ResizablePanel";

const ResizableHandle = ({
  withHandle = true,
  className,
  ...props
}) => (
  <PanelResizeHandle
    className={cn(
      "relative flex w-1 items-center justify-center bg-gray-600/50 hover:bg-gray-500/70 transition-colors cursor-col-resize after:absolute after:inset-y-0 after:left-1/2 after:w-8 after:-translate-x-1/2 focus-visible:outline-none data-[panel-group-direction=vertical]:h-1 data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:cursor-row-resize data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-8 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className,
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-2 items-center justify-center rounded-sm border border-gray-400/50 bg-gray-700/50">
        <GripVertical className="h-2.5 w-2.5 text-gray-300" />
      </div>
    )}
  </PanelResizeHandle>
);

export {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
};


