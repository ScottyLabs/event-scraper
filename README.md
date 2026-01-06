# Event Scraper

The Event Scraper service scrape data and upload them to S3 bucket from the following sources:

- 25Live
- Handshake
- Tartan Connect

Then the Event Scraper service notifies the Railway services defined in the `NOTIF_CONFIG` environment variable to restart their deployments, which are responsible for pulling the data from S3 bucket and processing them.

## System Design

![System Design Diagram](./docs/system-design.png)
*You can regenerate this diagram by pasting the [linked code](./docs/system-design.txt)
into [Mermaid](https://www.mermaidchart.com/play).*

## Accessing the Scraped Data

Follow the instruction in [Governance](https://github.com/ScottyLabs/governance/blob/main/README.md)
add yourself to the `event-scraper` team.

- Add yourself as a dev if you only need read access.
  - Then you can access the S3 bucket credentials in the [vault](https://secrets.scottylabs.org/ui/vault/secrets/ScottyLabs/kv/event-scraper%2Fread).
- Add yourself as a lead if you also need write access.
  - Then you can access the S3 bucket credentials in the [vault](https://secrets.scottylabs.org/ui/vault/secrets/ScottyLabs/kv/event-scraper%2Fadmin).

Make sure to justify your access request in the description of the PR in Governance.

## Development

Open the project with Dev Container. Populate the environment variables following the [env.ts](./src/env.ts) file. Most secrets are stored in Railway but you would need to supply your own CMU credentials. To run the service locally, run the following command:

```bash
bun src/index.ts
```

## FAQs

### Data Flow Rationale

The CMU password in Railway is sealed. However, it can be obtained by logging it, so we want to limit the number of people having access to this repo... Therefore this repo is only used to scrape the data and upload them to S3 bucket. The data processing should be done in different repos.

### Why are environment secrets only stored in Railway?

If someone need access to the RAILWAY_TOKEN, then they should have access to Railway already.
