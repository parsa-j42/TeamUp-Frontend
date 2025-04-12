# TeamUp Frontend

## Technologies
- React: JavaScript library for building user interfaces
-  TypeScript: Typed superset of JavaScript
- Vite: Next-generation frontend tooling
- Mantine: Customizable React components library
- Yarn: Package manager

## Setting up the Environment
### Prerequisites
- Node.js: (Version 14 or higher)
- Yarn package manage

### Environment Setup
1. Clone this repository.
```bash
git clone https://github.com/parsa-j42/TeamUp-Frontend.git
cd ./TeamUp-Frontend
```
2. Install dependencies
```bash
yarn install
```

3. Create a `.env` file in the root directory of the project and
```bash
cp .env.example .env
```
- You'll need to assign values to the environment variables in the `.env` file.

## Running the Application
### Development
To start the development server with auto-reload, run:
```bash
yarn dev
```

### Building for Production
To build the application for production, run:
```bash
yarn build
```

### Previewing the Production Build
To preview the production build, run:
```bash
yarn preview
```

## Environment Variables
The application currently uses the following environment variables:
VITE_HAS_PROJECTS: Controls project feature availability
VITE_IS_AUTHENTICATED: Controls authentication state

## Website URL
[TeamUpSAIT](https://TeamUpSAIT.tech/)
