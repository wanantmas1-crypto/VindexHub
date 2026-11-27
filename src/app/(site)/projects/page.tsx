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
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Portfolio</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Projects</h1>
        <p className="mt-3 max-w-2xl leading-7 text-muted">A showcase of work we’ve designed, built, and delivered.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <article key={project.id} className="group overflow-hidden rounded-2xl border border-border bg-surface transition duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none">
              {project.imageUrl ? (
                <Image src={project.imageUrl} alt={project.title} width={1200} height={700} className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
              ) : (
                <div className="flex h-48 items-center justify-center bg-slate-100 dark:bg-slate-800 text-muted"><Code2 className="h-8 w-8" /></div>
              )}
              <div className="p-6">
                <h2 className="text-lg font-semibold">{project.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{project.summary}</p>
                <p className="mt-3 text-sm leading-6 text-muted">{project.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {parseJsonArray<string>(project.techStack).map((tech) => <span key={tech} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">{tech}</span>)}
                </div>
                {(project.demoUrl || project.repoUrl) && (
                  <div className="mt-5 flex gap-3 text-sm">
                    {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"><ExternalLink className="h-4 w-4" />Demo</a>}
                    {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"><FolderGit2 className="h-4 w-4" />Repo</a>}
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
