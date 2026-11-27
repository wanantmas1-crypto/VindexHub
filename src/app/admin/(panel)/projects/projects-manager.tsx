"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { saveProject, deleteProject, setProjectActive, type AdminActionState } from "@/lib/admin-actions";
import type { Project } from "@/lib/db/schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { parseJsonArray } from "@/lib/utils";

const initial: AdminActionState = { ok: false, message: "" };

export function ProjectsManager({ initialProjects }: { initialProjects: Project[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Project | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [hidingId, setHidingId] = useState<number | null>(null);
  const [state, action, pending] = useActionState(async (s: AdminActionState, fd: FormData) => {
    const res = await saveProject(s, fd);
    if (res.ok) { setEditing(null); router.refresh(); }
    return res;
  }, initial);

  return (
    <main>
      <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
      <p className="mt-1 text-muted">Manage portfolio projects shown on the public site.</p>
      <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
        <form action={action} className="rounded-xl border border-border bg-surface p-5 space-y-3 h-fit">
          <h2 className="font-semibold">{editing ? "Edit Project" : "Add Project"}</h2>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <Input name="title" placeholder="Title" defaultValue={editing?.title} required />
          <Input name="slug" placeholder="Slug" defaultValue={editing?.slug} required />
          <Input name="summary" placeholder="Short summary" defaultValue={editing?.summary} required />
          <Textarea name="description" placeholder="Description" defaultValue={editing?.description} required rows={4} />
          <Textarea name="techStack" placeholder="Tech stack (one per line)" defaultValue={editing ? parseJsonArray<string>(editing.techStack).join("\n") : ""} rows={3} />
          <Input name="imageUrl" placeholder="Image URL" defaultValue={editing?.imageUrl ?? ""} />
          <Input name="demoUrl" placeholder="Demo URL" defaultValue={editing?.demoUrl ?? ""} />
          <Input name="repoUrl" placeholder="Repo URL" defaultValue={editing?.repoUrl ?? ""} />
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={editing?.featured ?? false} /> Featured</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="active" defaultChecked={(editing as any)?.active ?? true} /> Active</label>
          </div>
          {state.message && <p className={`text-sm ${state.ok ? "text-success" : "text-danger"}`}>{state.message}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>{pending ? "Saving..." : editing ? "Update" : "Create"}</Button>
            {editing && <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>}
          </div>
        </form>
        <div className="space-y-3">
          {initialProjects.map((project) => (
            <div key={project.id} className="rounded-xl border border-border bg-surface p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-medium">{project.title} {project.featured && <span className="text-xs text-primary">(featured)</span>} {!(project as any).active && <span className="text-xs text-muted">(hidden)</span>}</div>
                <div className="text-sm text-muted">{project.slug}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditing(project)}>Edit</Button>
                <form action={async (fd) => { setHidingId(project.id); await setProjectActive(fd); setHidingId(null); router.refresh(); }}>
                  <input type="hidden" name="id" value={project.id} />
                  <input type="hidden" name="active" value={(project as any).active ? "false" : "true"} />
                  <Button variant="secondary" size="sm" type="submit" disabled={hidingId === project.id}>{hidingId === project.id ? "..." : (project as any).active ? "Hide" : "Show"}</Button>
                </form>
                <form action={async (fd) => { setDeletingId(project.id); await deleteProject(fd); setDeletingId(null); router.refresh(); }}><input type="hidden" name="id" value={project.id} /><Button variant="danger" size="sm" type="submit" disabled={deletingId === project.id}>{deletingId === project.id ? "Deleting..." : "Delete"}</Button></form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
