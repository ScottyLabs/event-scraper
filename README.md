# Event Scraper

The Event Scraper service scrape data and upload them to S3 bucket from the following sources:

- 25Live
- Handshake
- Tartan Connect

## Data Flow

![Data Flow Diagram](./docs/data-flow.png)
*Use code from [docs/data-flow.txt](./docs/data-flow.txt) to generate the diagram in [Mermaid](https://www.mermaidchart.com/play).*

## Development

Open the project with Dev Container. Populate the environment variables following the [env.ts](./src/env.ts) file. Most secrets are stored in Railway but you would need to supply your own CMU credentials. To run the service locally, run the following command:

```bash
bun src/index.ts
```

## FAQs

### Data Flow Rationale

The CMU password in Railway is sealed. However, it can be obtained by logging it, so we want to limit the number of people having access to this repo... Therefore this repo is only used to scrape the data and upload them to S3 bucket. The data processing should be done in different repos.

### Why are environment secrets only stored in Railway?

If someone can get access to RAILWAY_TOKEN, then they would have access to Railway already.
