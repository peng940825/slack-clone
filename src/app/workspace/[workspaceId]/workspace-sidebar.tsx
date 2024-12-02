import { Loader, AlertTriangle } from "lucide-react";

import { useWorkspaceId } from "@/hooks/use-workspace-id";

import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";

import WorkspaceHeader from "./workspace-header";

const WorkspaceSidebar = () => {
  const workspaceId = useWorkspaceId();

  const { data: member, isLoading: memberLoading } = useCurrentMember({
    workspaceId,
  });
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({
    id: workspaceId,
  });

  if (memberLoading || workspaceLoading) {
    return (
      <div className="flex flex-col bg-[#5E2C5F] h-full items-center justify-center">
        <Loader className="size-5 animate-spin text-white" />
      </div>
    );
  }

  if (!member || !workspace) {
    return (
      <div className="flex flex-col gap-y-2 bg-[#5E2C5F] h-full items-center justify-center">
        <AlertTriangle className="size-5 text-white" />
        <p className="text-white text-sm">Workspace not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#5E2C5F] h-full">
      <WorkspaceHeader
        isAdmin={member.role === "admin"}
        workspace={workspace}
      />
    </div>
  );
};

export default WorkspaceSidebar;