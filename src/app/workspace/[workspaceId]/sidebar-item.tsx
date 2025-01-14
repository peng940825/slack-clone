import Link from "next/link";
import { MouseEvent } from "react";
import { LucideIcon } from "lucide-react";
import { IconType } from "react-icons/lib";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

const sidebarItemVariants = cva(
  "flex items-center gap-1.5 justify-start font-normal h-7 px-[18px] text-sm overflow-hidden",
  {
    variants: {
      variant: {
        default: "text-[#f9edffcc]",
        active: "text-[#481349] bg-white/90 hover:bg-white/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface SidebarItemProps {
  id: string;
  label: string;
  icon: LucideIcon | IconType;
  variant?: VariantProps<typeof sidebarItemVariants>["variant"];
}

const SidebarItem = ({ id, label, icon: Icon, variant }: SidebarItemProps) => {
  const workspaceId = useWorkspaceId();

  const preventNavigation = (event: MouseEvent<HTMLAnchorElement>) => {
    if (id === "threads" || id === "drafts") {
      event.preventDefault();
    }
  };

  return (
    <Button
      size="sm"
      variant="transparent"
      className={cn(sidebarItemVariants({ variant }))}
      asChild
    >
      <Link
        href={`/workspace/${workspaceId}/channel/${id}`}
        onClick={preventNavigation}
      >
        <Icon className="size-3.5 mr-1 shrink-0" />
        <span className="text-sm truncate">{label}</span>
      </Link>
    </Button>
  );
};

export default SidebarItem;
