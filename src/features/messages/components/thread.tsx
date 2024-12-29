import { useState } from "react";
import { XIcon, Loader, AlertTriangle } from "lucide-react";

import { Message } from "@/components/message";
import { Button } from "@/components/ui/button";

import { useWorkspaceId } from "@/hooks/use-workspace-id";

import { useGetMessage } from "@/features/messages/api/use-get-message";
import { useCurrentMember } from "@/features/members/api/use-current-member";

import { Id } from "../../../../convex/_generated/dataModel";

interface ThreadProps {
  messageId: Id<"messages">;
  onClose: () => void;
}

export const Thread = ({ messageId, onClose }: ThreadProps) => {
  const workspaceId = useWorkspaceId();

  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);

  const { data: currentMember } = useCurrentMember({ workspaceId });
  const { data: message, isLoading: loadingMessage } = useGetMessage({
    id: messageId,
  });

  if (loadingMessage) {
    return (
      <div className="h-full flex flex-col">
        <div className="h-[49px] flex items-center justify-between px-4 border-b">
          <p className="text-lg font-bold">Thread</p>
          <Button size="iconSm" variant="ghost" onClick={onClose}>
            <XIcon className="!size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className="h-[calc(100%-49px)] flex flex-col items-center justify-center gap-y-2">
          <Loader className="!size-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="h-full flex flex-col">
        <div className="h-[49px] flex items-center justify-between px-4 border-b">
          <p className="text-lg font-bold">Thread</p>
          <Button size="iconSm" variant="ghost" onClick={onClose}>
            <XIcon className="!size-5 stroke-[1.5]" />
          </Button>
        </div>
        <div className="h-[calc(100%-49px)] flex flex-col items-center justify-center gap-y-2">
          <AlertTriangle className="!size-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Message not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="h-[49px] flex items-center justify-between px-4 border-b">
        <p className="text-lg font-bold">Thread</p>
        <Button size="iconSm" variant="ghost" onClick={onClose}>
          <XIcon className="!size-5 stroke-[1.5]" />
        </Button>
      </div>
      <Message
        id={message._id}
        body={message.body}
        image={message.image}
        memberId={message.memberId}
        isAuthor={message.memberId === currentMember?._id}
        authorName={message.user.name}
        authorImage={message.user.image}
        createdAt={message._creationTime}
        updatedAt={message.updateAt}
        reactions={message.reactions}
        isEditing={editingId === message._id}
        setEditingId={setEditingId}
        hideThreadButton
      />
    </div>
  );
};
