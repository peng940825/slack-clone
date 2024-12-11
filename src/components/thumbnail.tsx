/* eslint-disable @next/next/no-img-element */

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ThumbnailProps {
  url: string | null | undefined;
}

export const Thumbnail = ({ url }: ThumbnailProps) => {
  if (!url) {
    return null;
  }

  return (
    <Dialog>
      <DialogTrigger className="w-fit">
        <div className="relative overflow-hidden max-w-[360px] my-2 cursor-zoom-in">
          <img
            src={url}
            className="rounded-md object-cover size-full"
            alt="Message image"
          />
        </div>
      </DialogTrigger>
      <DialogContent
        className="border-none bg-transparent shadow-none p-0"
        aria-describedby={undefined}
      >
        <DialogTitle className="hidden" />
        <div className="max-h-[95vh]">
          <img
            src={url}
            className="rounded-md object-cover size-full"
            alt="Message image"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
