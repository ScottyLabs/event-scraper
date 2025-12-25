import env from "../env";

const RAILWAY_API = "https://backboard.railway.app/graphql/v2";

export async function getProjectWithServicesAndEnvs() {
  const query = `
    query projects {
      projects {
        edges {
          node {
            id
            name
            environments {
              edges {
                node {
                  id
                  name
                }
              }
            }
            services {
              edges {
                node {
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
  `;

  const res = await fetch(RAILWAY_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.RAILWAY_TOKEN}`,
    },
    body: JSON.stringify({ query }),
  });

  const data = (await res.json()) as {
    data: {
      projects: {
        edges: {
          node: {
            id: string;
            name: string;
            environments: { edges: { node: { id: string; name: string } }[] };
            services: { edges: { node: { id: string; name: string } }[] };
          };
        }[];
      };
    };
  };

  // flatten GraphQL edge structure
  return data.data.projects.edges.map(({ node }) => ({
    id: node.id,
    name: node.name,
    environments: node.environments.edges.map(({ node }) => node),
    services: node.services.edges.map(({ node }) => node),
  }));
}

/**
 * Restarts a deployment by project, environment, and service.
 * @param {Object} project - The project object.
 * @param {Object} environment - The environment object.
 * @param {Object} service - The service object.
 */
export const restartDeployment = async (
  project: { id: string; name: string },
  environment: { id: string; name: string },
  service: { id: string; name: string },
) => {
  const deploymentId = await fetchLatestDeployment(
    project.id,
    environment.id,
    service.id,
  );

  if (!deploymentId) {
    console.error(
      "No deployment found for project:",
      project.name,
      "service:",
      service.name,
      "environment:",
      environment.name,
    );
    return;
  }

  await restartDeploymentHelper(deploymentId);
};

// For more information, see: https://docs.railway.com/guides/manage-deployments
const fetchLatestDeployment = async (
  projectId: string,
  environmentId: string,
  serviceId: string,
) => {
  const query = `
      query latestDeployment($projectId: String!, $environmentId: String!, $serviceId: String!) {
        deployments(
          first: 1
          input: {
            projectId: $projectId
            environmentId: $environmentId
            serviceId: $serviceId
          }
        ) {
          edges {
            node {
              id
              staticUrl
            }
          }
        }
      }
    `;

  const res = await fetch(RAILWAY_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.RAILWAY_TOKEN}`,
    },
    body: JSON.stringify({
      query,
      variables: { projectId, environmentId, serviceId },
    }),
  });

  const data = (await res.json()) as {
    data: { deployments: { edges: { node: { id: string } }[] } };
  };
  return data.data.deployments.edges[0]?.node?.id;
};

/**
 * Restarts a deployment by deployment ID.
 * For more information, see: https://docs.railway.com/guides/manage-deployments
 * @param {string} deploymentId
 */
const restartDeploymentHelper = async (deploymentId: string) => {
  const mutation = `
      mutation restartDeployment($id: String!) {
        deploymentRestart(id: $id)
      }
    `;

  const res = await fetch(RAILWAY_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.RAILWAY_TOKEN}`,
    },
    body: JSON.stringify({
      query: mutation,
      variables: { id: deploymentId },
    }),
  });

  const data = (await res.json()) as { errors?: { message: string }[] };
  if (data.errors) {
    console.error("Railway API Error:", data.errors);
  }
};
