import env from "../env";

export const loadNotifConfig = () => {
  const raw = env.NOTIF_CONFIG;
  if (!raw) throw new Error("Missing NOTIF_CONFIG environment variable.");

  let parsed: {
    serviceId: string;
    projectId: string;
    environmentIds: string[];
  }[];

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("NOTIF_CONFIG is not valid JSON.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("NOTIF_CONFIG must be an array.");
  }

  for (const project of parsed) {
    if (
      !project.projectId ||
      !project.serviceId ||
      !Array.isArray(project.environmentIds)
    ) {
      throw new Error(
        "Each project in NOTIF_CONFIG must have projectId, serviceId, and environmentIds.",
      );
    }
  }

  return parsed;
};
