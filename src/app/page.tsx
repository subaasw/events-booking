import Link from "next/link";
import { unstable_cache } from "next/cache";

import { getEvents } from "@/store/dataStore";
import {
  formatRgbObject,
  getDominantColor,
  getRelativeLuminance,
  makeColorMoreContrastyPreservingSaturation,
  type rgbObject,
} from "@/utils/sampleColor";
import { type EventInfo } from "@/context/user-sessions-context";

import DefaultLayout from "@/components/layouts/DefaultLayout";

const getCachedDominantColor = unstable_cache(getDominantColor);

type EventAndColor = EventInfo & { bgColor: string; textColor: string };

export const metadata = {
  title: "Event Booking",
};

export default async function Home() {
  const events: EventInfo[] = getEvents();

  const eventsWithColors: Promise<EventAndColor[]> = Promise.all(
    events.map(async (eventItem) => {
      const imageUrl: string = eventItem.image;
      const sourceDominantColor: rgbObject = await getCachedDominantColor(
        imageUrl
      );
      const colorLuminance: number = getRelativeLuminance(sourceDominantColor);
      const isTooDark: boolean = colorLuminance < 0.5;
      const proximityToGrey: number = Math.abs(0.5 - colorLuminance);
      let dominantColor;
      if (proximityToGrey < 0.1) {
        dominantColor = formatRgbObject(
          makeColorMoreContrastyPreservingSaturation(
            sourceDominantColor,
            isTooDark ? "darken" : "lighten",
            0.25,
            0.8
          )
        );
      } else if (proximityToGrey < 0.3) {
        dominantColor = formatRgbObject(
          makeColorMoreContrastyPreservingSaturation(
            sourceDominantColor,
            isTooDark ? "darken" : "lighten",
            0.15,
            0.25
          )
        );
      } else {
        dominantColor = formatRgbObject(sourceDominantColor);
      }
      const defaultTextColor = isTooDark
        ? "var(--Brand-White)"
        : "var(--Brand-Black)";

      const currentEventAndColor: EventAndColor = {
        ...eventItem,
        bgColor: dominantColor,
        textColor: defaultTextColor,
      };
      return currentEventAndColor;
    })
  );

  const eventsWithColorsResolved = await eventsWithColors;

  return (
    <DefaultLayout>
      <div className="flex flex-col gap-3">
        <span className="text-4xl md:sticky md:top-5 md:z-50">
          Available Mentoring Sessions
        </span>
        <div className="flex flex-col gap-10">
          <span className="max-w-screen-md">
            From an one-on-one introduction to React&apos;s basics all the way
            up to a deep dive into state mechanics - we got just the right
            session for you!
          </span>
          <div className="md:grid md:grid-cols-2 md:gap-10 lg:grid-cols-3  flex flex-col gap-5">
            {eventsWithColorsResolved.map((eventItem) => (
              <Link
                key={eventItem.id}
                href={"/event/" + eventItem.id}
                className="flex flex-col  rounded-xl overflow-hidden "
              >
                <div className="overflow-hidden h-48 min-h-48">
                  <img src={eventItem.image} />
                </div>
                <div
                  className="flex flex-col gap-1 p-5 flex-grow"
                  style={{
                    backgroundColor: "rgb(" + eventItem.bgColor + ")",
                    color: eventItem.textColor,
                  }}
                >
                  <span className="text-2xl">{eventItem.name}</span>
                  <span>{eventItem.tagline}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
