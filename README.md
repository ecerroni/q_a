# LawY Demo

Ecosystem:
- Mercurius Graphql Server (with Fastify)
- Apollo Client 3.x
- React (frontend web client)


# DOCUMENTATION
- [Installation](#installation)
- [Node version compatibility](#node-version-compatibility)
- [Usage](#usage)
  - [Users](#users)

## Installation
Clone this repository and install dependencies from the project's root folder:


From the project's root folder

`yarn install-all`

*Tested on*:
- Linux Intel: Ubuntu 22.04.5 LTS
- Apple Silicon: macOS Sonoma 14.7

### Running the Entire Development Environment

From the project's root folder, run:

`yarn start`

### Running Servers Individually (Recommended)

You can also run servers separately, which is recommended for better control and debugging.

#### GraphQL Server

Run this first. From the project's root folder:


`cd backend && yarn start`


#### APP - REACT
from the project's root folder

`cd app && yarn start`


## Node Version compatibility
### Bcrypt
Depending on bcrypt's version you need to use a specific node LTS version to make it work properly. This is even more important in production environemnts to avoid build errors like `gyp ERR!....`

Here there is a table compatibility you should follow:
https://www.npmjs.com/package/bcrypt#version-compatibility

The current bcrypt version used in this repo requires Node.js LTS >= 12

### NVM
Using the [Node Version Manager](https://github.com/nvm-sh/nvm) is recommended. Also enabling  [automatic switching](https://github.com/nvm-sh/nvm#deeper-shell-integration) would be helpful as well.

Currently this repo will run only node **v20.9.0**
This version constraint is enforced by a few scripts running during server startup.

---

## Usage

### Users

A mock user is provided for this demo:

- **Username:** `admin`
- **Password:** `123456`

--------------


## Notes

### Code Structure

This demo is built from boilerplates typically used to jumpstart new projects. For the purpose of this demo, relevant backend code for the Q&A implementation can be found in:

- Backend: `src/datacomponents` (**QA**) and `src/datasources` (**api/OpenAI**, **db/QA**)
- Frontend: `src/api`, `src/components`, `src/pages`, `src/routes`

### Database (MongoDB)

The application expects a MongoDB instance running on port `27017` and reachable at `localhost`. On the first server start, it will create a database named `qa` and add the admin user.

If you don't have MongoDB installed locally, you can quickly set it up using Docker:

`docker run --name local.mongo -p 27017:27017 -v ~/data/db:/data/db -d mongo`

### Search Functionality

The search functionality leverages a custom npm package for MongoDB, authored and published previously:

- [mongo-search-parameters](https://github.com/ecerroni/mongo-search-parameters)

Most utilities and hooks in this repository are custom-built from scratch.

### OpenAI Integration

You will need an **OpenRouter API Key** to successfully start the server. Provide your key by creating a file at `backend/env/.env` and adding: 
`API_OPEN_AI_KEY=your-key-value`.

If you don't have an OpenRouter API key, you can use an **OpenAI API Key** instead by also overriding the `API_OPEN_AI_ENDPOINT` value.

Refer to `backend/env/.example.env` for all available environment variables you can supply or override.
