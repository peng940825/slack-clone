import Quill from "quill";
import { useRef } from "react";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface ChatInputProps {
  placeholder: string;
}

export const ChatInput = ({ placeholder }: ChatInputProps) => {
  const editorRef = useRef<Quill | null>(null);

  return (
    <div className="px-5 w-full">
      <Editor
        disabled={false}
        innerRef={editorRef}
        onSubmit={() => {}}
        placeholder={placeholder}
      />
    </div>
  );
};
