# Event Scraper

The Event Scraper service scrape data and upload them to S3 bucket from the following sources:

- 25Live
- Handshake
- Tartan Connect

## Data Flow

![Data Flow Diagram](./imgs/data-flow.png)
*Use code from [docs/data-flow.txt](./docs/data-flow.txt) to generate the diagram in [Mermaid](https://www.mermaidchart.com/play).*

## Development

Open the project with Dev Container. Populate the environment variables following the [env.ts](./src/env.ts) file. Most secrets are stored in Railway but you would need to supply your own CMU credentials. To run the service locally, run the following command:

```bash
bun src/index.ts
```

Visit the [internal Notion documentation](https://www.notion.so/wiki-scottylabs/Event-Scraper-2b496192554c80f8bd55d8cd108fcd78) for more details.
