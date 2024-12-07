"use client";

import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader, TriangleAlert } from "lucide-react";

import { useWorkspaceId } from "@/hooks/use-workspace-id";

import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";

const WorkspaceIdPage = () => {
  const router = useRouter();

  const workspaceId = useWorkspaceId();

  const [open, setOpen] = useCreateChannelModal();

  const { data: member, isLoading: memberLoading } = useCurrentMember({
    workspaceId,
  });
  const { data: channels, isLoading: channelsLoading } = useGetChannels({
    workspaceId,
  });
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({
    id: workspaceId,
  });

  const isAdmin = useMemo(() => member?.role === "admin", [member?.role]);
  const channelId = useMemo(() => channels?.[0]?._id, [channels]);

  useEffect(() => {
    if (
      !member ||
      !workspace ||
      memberLoading ||
      channelsLoading ||
      workspaceLoading
    ) {
      return;
    }

    if (channelId) {
      router.push(`/workspace/${workspaceId}/channel/${channelId}`);
    } else if (!open && isAdmin) {
      setOpen(true);
    }
  }, [
    open,
    member,
    router,
    isAdmin,
    setOpen,
    workspace,
    channelId,
    workspaceId,
    memberLoading,
    channelsLoading,
    workspaceLoading,
  ]);

  if (memberLoading || channelsLoading || workspaceLoading) {
    return (
      <div className="h-full flex flex-1 items-center justify-center flex-col gap-2">
        <Loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!member || !workspace) {
    return (
      <div className="h-full flex flex-1 items-center justify-center flex-col gap-2">
        <TriangleAlert className="size-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Workspace not found
        </span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-1 items-center justify-center flex-col gap-2">
      <TriangleAlert className="size-6 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">No channel found</span>
    </div>
  );
};

export default WorkspaceIdPage;
