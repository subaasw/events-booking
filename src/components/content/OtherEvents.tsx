import { type EventInfo } from "@/context/user-sessions-context";
import Link from "next/link";

export default function OtherEvents({ eventItem }: { eventItem: EventInfo }) {
  return (
    <div className="p-5">
      <Link
        href={"/event/" + eventItem.id}
        className="flex flex-col gap-5 relative rounded-3xl overflow-hidden text-right"
      >
        <div className="max-h-56 overflow-hidden relative">
          <img
            className="relative mix-blend-luminosity opacity-25"
            src={eventItem.image}
          />
        </div>
        <div className="flex flex-col gap-2 absolute top-0 left-0 right-0 bottom-0 justify-end py-6 px-8 z-[2]">
          <span className="font-medium">Next Event</span>
          <span className="text-3xl">{eventItem.name}</span>
        </div>
      </Link>
    </div>
  );
}
