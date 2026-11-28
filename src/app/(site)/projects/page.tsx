import type { Metadata } from "next";
import Image from "next/image";
import { Code2, ExternalLink, FolderGit2 } from "lucide-react";
import { Container } from "@/components/container";
import { getProjects } from "@/lib/data";
import { parseJsonArray } from "@/lib/utils";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <main className="py-14 sm:py-16">
      <Container>
        <div data-reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Our Work</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Projects Built with People in Mind</h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted">Every project here started with a real problem and a real conversation. Here’s a look at what we’ve built, learned, and shipped alongside our clients.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((project, i) => (
            <article key={project.id} data-reveal style={{ "--reveal-delay": `${i * 60}ms` } as any} className="group hover-lift overflow-hidden rounded-xl border border-border bg-surface hover:border-primary/20 dark:hover:shadow-none">
              {project.imageUrl ? (
                <Image src={project.imageUrl} alt={project.title} width={800} height={500} className="aspect-[16/10] w-full object-cover transition duration-300 group-hover:scale-[1.02]" unoptimized />
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center bg-slate-100 dark:bg-slate-800 text-muted"><Code2 className="h-7 w-7" /></div>
              )}
              <div className="p-4">
                <h2 className="font-semibold leading-snug line-clamp-1">{project.title}</h2>
                <p className="mt-1 text-xs leading-5 text-muted line-clamp-2">{project.summary}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {parseJsonArray<string>(project.techStack).slice(0, 4).map((tech) => <span key={tech} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">{tech}</span>)}
                </div>
                {(project.demoUrl || project.repoUrl) && (
                  <div className="mt-3 flex gap-3 text-xs">
                    {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-primary hover:underline"><ExternalLink className="h-3.5 w-3.5" />Demo</a>}
                    {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-primary hover:underline"><FolderGit2 className="h-3.5 w-3.5" />Repo</a>}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </Container>
    </main>
  );
}
