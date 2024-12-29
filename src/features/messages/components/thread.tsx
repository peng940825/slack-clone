import Quill from "quill";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useRef, useState } from "react";
import { XIcon, Loader, AlertTriangle } from "lucide-react";
import { format, isToday, isYesterday, differenceInMinutes } from "date-fns";

import { Message } from "@/components/message";
import { Button } from "@/components/ui/button";

import { useChannelId } from "@/hooks/use-channel-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

import { useGetMessage } from "@/features/messages/api/use-get-message";
import { useGetMessages } from "@/features/messages/api/use-get-messages";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useCreateMessage } from "@/features/messages/api/use-create-message";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";

import { Id } from "../../../../convex/_generated/dataModel";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

const TIME_THRESHOLD = 5;

interface ThreadProps {
  messageId: Id<"messages">;
  onClose: () => void;
}

type CreateMessageValues = {
  channelId: Id<"channels">;
  workspaceId: Id<"workspaces">;
  parentMessageId: Id<"messages">;
  body: string;
  image: Id<"_storage"> | undefined;
};

const formatDateLabel = (dateStr: string) => {
  const date = new Date(dateStr);

  if (isToday(date)) {
    return "Today";
  }

  if (isYesterday(date)) {
    return "Yesterday";
  }

  return format(date, "EEEE, MMMM d");
};

export const Thread = ({ messageId, onClose }: ThreadProps) => {
  const channelId = useChannelId();
  const workspaceId = useWorkspaceId();

  const editorRef = useRef<Quill | null>(null);

  const [editorKey, setEditorKey] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);

  const { mutate: createMessage } = useCreateMessage();
  const { mutate: generateUploadUrl } = useGenerateUploadUrl();

  const { data: currentMember } = useCurrentMember({ workspaceId });
  const { data: message, isLoading: loadingMessage } = useGetMessage({
    id: messageId,
  });
  const { status, results, loadMore } = useGetMessages({
    channelId,
    parentMessageId: messageId,
  });

  const canLoadMore = status === "CanLoadMore";
  const isLoadingMore = status === "LoadingMore";

  const handleSubmit = async ({
    body,
    image,
  }: {
    body: string;
    image: File | null;
  }) => {
    try {
      setIsPending(true);
      editorRef?.current?.enable(false);

      const values: CreateMessageValues = {
        channelId,
        workspaceId,
        parentMessageId: messageId,
        body,
        image: undefined,
      };

      if (image) {
        const url = await generateUploadUrl({}, { throwError: true });

        if (!url) {
          throw new Error("URL not found");
        }

        const result = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": image.type },
          body: image,
        });

        if (!result.ok) {
          throw new Error("Failed to upload image");
        }

        const { storageId } = await result.json();

        values.image = storageId;
      }

      await createMessage(values, { throwError: true });

      setEditorKey((prevKey) => prevKey + 1);
      // editorRef.current?.setContents([]);
    } catch {
      toast.error("Failed to send message");
    } finally {
      setIsPending(false);
      editorRef?.current?.enable(true);
    }
  };

  const groupedMessages = results?.reduce(
    (groups, message) => {
      const date = new Date(message!._creationTime);
      const dateKey = format(date, "yyyy-MM-dd");

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].unshift(message);

      return groups;
    },
    {} as Record<string, typeof results>
  );

  if (loadingMessage || status === "LoadingFirstPage") {
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
      <div className="flex-1 flex flex-col-reverse pb-4 overflow-y-auto messages-scrollbar">
        {Object.entries(groupedMessages || {}).map(([dateKey, messages]) => (
          <div key={dateKey}>
            <div className="text-center my-2 relative">
              <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
              <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
                {formatDateLabel(dateKey)}
              </span>
            </div>
            {messages.map((message, index) => {
              if (!message) {
                return null;
              }

              const prevMessage = messages[index - 1];

              const isCompact = prevMessage
                ? prevMessage.user?._id === message.user?._id &&
                  differenceInMinutes(
                    new Date(message._creationTime),
                    new Date(prevMessage._creationTime)
                  ) < TIME_THRESHOLD
                : false;

              return (
                <Message
                  key={message._id}
                  id={message._id}
                  isAuthor={message.memberId === currentMember?._id}
                  isEditing={editingId === message._id}
                  image={message.image}
                  memberId={message.memberId}
                  body={message.body}
                  updatedAt={message.updateAt}
                  createdAt={message._creationTime}
                  reactions={message.reactions}
                  setEditingId={setEditingId}
                  isCompact={isCompact}
                  authorName={message.user.name}
                  authorImage={message.user.image}
                  threadCount={message.threadCount}
                  threadImage={message.threadImage}
                  threadTimestamp={message.threadTimestamp}
                  hideThreadButton
                />
              );
            })}
          </div>
        ))}
        <div
          ref={(el) => {
            if (el) {
              const observer = new IntersectionObserver(
                ([entry]) => {
                  if (entry.isIntersecting && canLoadMore) {
                    loadMore();
                  }
                },
                { threshold: 1.0 }
              );

              observer.observe(el);

              return () => {
                observer.disconnect();
              };
            }
          }}
          className="h-1"
        />
        {isLoadingMore && (
          <div className="text-center my-2 relative">
            <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
            <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border border-gray-300 shadow-sm">
              <Loader className="!size-4 animate-spin" />
            </span>
          </div>
        )}
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
      <div className="px-4">
        <Editor
          key={editorKey}
          innerRef={editorRef}
          disabled={isPending}
          onSubmit={handleSubmit}
          placeholder="Reply..."
        />
      </div>
    </div>
  );
};
