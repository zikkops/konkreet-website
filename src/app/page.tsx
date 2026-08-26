import { About } from "@/components/About";
import { BackToProjects } from "@/components/BackToProjects";
import { Closing } from "@/components/Closing";
import { Expertise } from "@/components/Expertise";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Method } from "@/components/Method";
import {
  ProfileBand,
  ProfileDivider,
  ProjectProfile,
} from "@/components/ProjectProfile";
import { ProjectsIndex } from "@/components/ProjectsIndex";
import { profiles } from "@/data/content";

export default function Home() {
  return (
    <>
      <Header />

      <main className="flex-1">
        <Hero />
        <About />
        <Method />
        <Expertise />
        <ProjectsIndex />

        {profiles.map((profile, index) => {
          // The first profile of each group gets the teal band; the rest
          // are separated by a hairline rule.
          const startsGroup = profile.group !== profiles[index - 1]?.group;

          return (
            <div key={`${profile.label}-${index}`}>
              {startsGroup ? (
                <ProfileBand>{profile.group}</ProfileBand>
              ) : (
                <ProfileDivider />
              )}
              <ProjectProfile profile={profile} />
            </div>
          );
        })}

        <Closing />
      </main>

      <BackToProjects />
    </>
  );
}
