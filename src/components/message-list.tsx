import { format, isToday, isYesterday, differenceInMinutes } from "date-fns";

import { GetMessagesReturnType } from "@/features/messages/api/use-get-messages";

import { Message } from "./message";

const TIME_THRESHOLD = 5;

interface MessageListProps {
  data: GetMessagesReturnType | undefined;
  canLoadMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  memberName?: string;
  memberImage?: string;
  channelName?: string;
  channelCreationTime?: number;
  variant?: "channel" | "thread" | "conversation";
}

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

export const MessageList = ({
  data,
  canLoadMore,
  isLoadingMore,
  loadMore,
  memberName,
  memberImage,
  channelName,
  channelCreationTime,
  variant = "channel",
}: MessageListProps) => {
  const groupedMessages = data?.reduce(
    (groups, message) => {
      const date = new Date(message!._creationTime);
      const dateKey = format(date, "yyyy-MM-dd");

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].unshift(message);

      return groups;
    },
    {} as Record<string, typeof data>
  );

  return (
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
                isAuthor={false}
                isEditing={false}
                image={message.image}
                memberId={message.memberId}
                body={message.body}
                updatedAt={message.updateAt}
                createdAt={message._creationTime}
                reactions={message.reactions}
                setEditingId={() => {}}
                isCompact={isCompact}
                authorName={message.user.name}
                authorImage={message.user.image}
                threadCount={message.threadCount}
                threadImage={message.threadImage}
                threadTimestamp={message.threadTimestamp}
                hideThreadButton={false}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};