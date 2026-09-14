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
import { getSiteContent } from "@/server/content";

export default async function Home() {
  const content = await getSiteContent();
  const { profiles } = content;

  return (
    <>
      <Header />

      <main className="flex-1">
        <Hero hero={content.hero} stats={content.stats} />
        <About about={content.about} />
        <Method method={content.method} imageBand={content.imageBand} />
        <Expertise expertise={content.expertise} />
        <ProjectsIndex
          intro={content.projectsIntro}
          groups={content.projectGroups}
          profiles={profiles}
        />

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
              <ProjectProfile profile={profile} caption={content.galleryCaption} />
            </div>
          );
        })}

        <Closing closing={content.closing} contact={content.contact} footer={content.footer} />
      </main>

      <BackToProjects />
    </>
  );
}
