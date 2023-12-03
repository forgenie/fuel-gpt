# FuelGPT

Fuel GPT is a lightweight chatbot built using Next.js and the OpenAI Assistants API. It was trained on documentation and code examples from Fuel website and repositories. Its capabilities are:

- Ask anything about Fuel and Sway documentation.
- Generate simple Sway smart contract examples.
- Translate from Solidity to Sway.

Original front-end code was taked from [chatgpt-minimal](https://github.com/blrchen/chatgpt-minimal/tree/main)

## Running Locally

1. Install NodeJS 18.
2. Clone the repository.
3. Install dependencies with `npm install`.
4. Copy `.env.example` to `.env.local` and modify environment variables accordingly.
5. Start the application using `npm run dev`.
6. Visit `http://localhost:3000` in your browser.

## Running Locally with Docker

1. Clone the repository and navigate to the root directory.
2. Update the `OPENAI_API_KEY` environment variable in the `docker-compose.yml` file.
3. Build the application using `docker-compose build .`.
4. Start the application by running `docker-compose up -d`.

## Environment Variables

Required environment variables:

For OpenAI account:

| Name                | Description                                                                                             | Default Value            |
| ------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------ |
| OPENAI_API_BASE_URL | Use if you intend to use a reverse proxy for `api.openai.com`.                                          | `https://api.openai.com` |
| OPENAI_API_KEY      | Secret key string obtained from the [OpenAI API website](https://platform.openai.com/account/api-keys). |
