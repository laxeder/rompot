const { execSync } = require("child_process");

const peerDeps = Object.entries(require("./package.json").peerDependencies);

for (const [dep, version] of peerDeps) {
  execSync(`npm install -g ${dep}@${version}`);
}
