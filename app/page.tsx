import Experience from "@/components/Experience";
import LinkWithIcon from "@/components/LinkWithIcon";
import Posts from "@/components/Posts";
import PostsSkeleton from "@/components/PostsSkeleton";
import Projects from "@/components/Projects";
import Skills from "@/components/Skills";
import Socials from "@/components/Socials";
import SwipeCards from "@/components/SwipeCards";
import { Button } from "@/components/ui/Button";
import { getPosts } from "@/lib/posts";
import {
  ArrowRightIcon,
  FileDown,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import homeContent from "@/data/home.json";
import { calculateAge } from "@/lib/calculate-age";

const ARBAZ_DOB = new Date("2004-06-26");
const LIMIT = 2;

async function RecentPosts() {
  const posts = (await getPosts())
    .filter((post) => !post.draft)
    .slice(0, LIMIT);
  return <Posts posts={posts} />;
}

export default function Home() {
  const currentAge = calculateAge(ARBAZ_DOB)

  return (
    <article className="mt-8 flex flex-col gap-16 pb-16">
      <section className="flex flex-col items-start gap-8 md:flex-row-reverse md:items-center md:justify-between">
        <SwipeCards className="md:mr-8" />

        <div className="flex max-w-[320px] flex-col sm:max-w-full">
          <h1 className="title text-balance text-4xl sm:text-5xl">
            {homeContent.introduction.greeting}
          </h1>

          <p className="mt-2 whitespace-nowrap text-sm font-medium sm:text-base">
            {currentAge}yo software engineer from India 🇮🇳
          </p>

          <p className="mt-4 max-w-md text-balance text-sm sm:text-base">
            {homeContent.introduction.description}
          </p>

          <section className="mt-6 flex flex-wrap items-center gap-4">
            <Link href="https://drive.google.com/file/d/1Mr_PhtFKzy1UiH0HkT5MNM67xRMZy6ld/view?usp=sharing" target="_blank">
              <Button variant="outline">
                <span className="font-semibold">Resume</span>
                <FileDown className="ml-2 size-5" />
              </Button>
            </Link>
            <Socials />
          </section>
        </div>
      </section>

      <Experience />

      <Skills />

      <section className="flex flex-col gap-8">
        <div className="flex justify-between">
          <h2 className="title text-2xl sm:text-3xl">featured projects</h2>
          <LinkWithIcon
            href="/projects"
            position="right"
            icon={<ArrowRightIcon className="size-5" />}
            text="view more"
          />
        </div>
        <Projects limit={LIMIT} />
      </section>

      <section className="flex flex-col gap-8">
        <div className="flex justify-between">
          <h2 className="title text-3xl">recent posts</h2>
          <LinkWithIcon
            href="/blog"
            position="right"
            icon={<ArrowRightIcon className="size-5" />}
            text="view more"
          />
        </div>
        <Suspense fallback={<PostsSkeleton rows={LIMIT} />}>
          <RecentPosts />
        </Suspense>
      </section>
    </article>
  );
}
