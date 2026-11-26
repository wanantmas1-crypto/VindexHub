import { getAllProjects } from "@/lib/data";
import { ProjectsManager } from "./projects-manager";

export default async function AdminProjectsPage() {
  const projects = await getAllProjects();
  return <ProjectsManager initialProjects={projects} />;
}
