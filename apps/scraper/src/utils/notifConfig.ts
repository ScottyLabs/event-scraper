import env from "../env";

/**
 * Loads the NOTIF_CONFIG environment variable and returns a set of project names and a map of project names to service names.
 * The NOTIF_CONFIG is a comma-separated list of project names and service names.
 * The project names and service names are separated by a slash (/).
 * @returns {Set<string>} A set of project names.
 * @returns {Record<string, string[]>} A map of project names to service names.
 */
export const loadNotifConfig = () => {
  const raw = env.NOTIF_CONFIG;
  const projects = raw.split(",");
  const projectSet = new Set<string>();
  const projectToServices: Record<string, string[]> = {};

  for (const project of projects) {
    // The project name and service name are separated by a slash (/).
    const [projectName, serviceName] = project.split("/");
    if (!projectName || !serviceName) {
      throw new Error(
        `Invalid project or service name in NOTIF_CONFIG: ${project}`,
      );
    }

    projectSet.add(projectName);
    if (!projectToServices[projectName]) {
      projectToServices[projectName] = [];
    }
    projectToServices[projectName].push(serviceName);
  }

  return { projectSet, projectToServices };
};
