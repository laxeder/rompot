const { execSync } = require("child_process");

const peerDeps = Object.entries(require("./package.json").peerDependencies);

peerDeps.forEach(([dep, version]) => execSync(`npm install -g ${dep}@${version}`));
