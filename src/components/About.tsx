import Image from "next/image";
import { Eyebrow } from "./Eyebrow";
import { about } from "@/data/content";

export function About() {
  return (
    <section
      id="about"
      className="flex flex-col gap-[50px] px-[var(--gutter)] py-[var(--section-y)] lg:flex-row"
    >
      {/* Both columns keep the container default 10px padding from the source. */}
      <div className="relative p-[10px] lg:w-[37%]">
        <Image
          src={about.primaryImage}
          alt="Construction site under execution"
          width={407}
          height={470}
          className="h-[470px] w-full max-w-[407px] object-cover"
        />
        {/* Framed inset image, overlapping the lower-right of the main image. */}
        <div className="bottom-[53px] right-0 hidden bg-white p-5 lg:absolute lg:block">
          <Image
            src={about.insetImage}
            alt="Structural detail on site"
            width={244}
            height={284}
            className="h-[284px] w-[244px] object-cover"
          />
        </div>
      </div>

      <div className="flex flex-col gap-5 p-[10px] lg:w-[50%]">
        <Eyebrow>{about.eyebrow}</Eyebrow>

        <h2 className="display text-[clamp(38px,5.5vw,64px)] text-primary">
          {about.title}
        </h2>

        <p className="text-[18px] text-primary">{about.paragraphs[0]}</p>

        <span
          className="my-[15px] block h-0 w-[128px] border-t-2 border-copper"
          aria-hidden="true"
        />

        <p className="text-[18px] text-primary">{about.paragraphs[1]}</p>

        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {about.competencies.map((item) => (
            <li
              key={item}
              className="border border-black/11 bg-white p-4 text-[13px] font-bold uppercase tracking-[0.08em] text-primary"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
