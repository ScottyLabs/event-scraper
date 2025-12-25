// For more information, see: https://docs.railway.com/guides/manage-deployments

import env from "../env";

const RAILWAY_API = "https://backboard.railway.app/graphql/v2";

export const fetchLatestDeployment = async (
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
 * @param {string} deploymentId
 */
export const restartDeployment = async (deploymentId: string) => {
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
