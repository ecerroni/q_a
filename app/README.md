# Main Packages
- React
- Tailwind
- Typescript
- Vite
- Jotai
- React Hook Form
- Yarn
- Custom Scripts

## Usage
### App
`yarn start`
The above will also install the packages at first run.

### Testing
`yarn test`

## Notes
### Custom scripts
In the `package.json`, there are two additional scripts: `requirements-check` and `preinstall`. These scripts are used to ensure that everyone is using the same Node.js version while running this repository.

This setup assumes that the developer is using **NVM** (Node Version Manager) for managing different Node.js versions. 

If you encounter any issues running these scripts, you can simply remove the preinstall script from the package.json.
