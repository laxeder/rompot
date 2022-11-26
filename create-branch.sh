#! /bin/bash +x

# Preparing branches
git add .; git commit -m "Initial commit"; git push; git fetch; git pull;

# Create, enter and push dev branch
git switch -c dev; git switch dev; git push --set-upstream origin dev

# Add, commit and push files in branch dev
git add .; git commit -m "Create branch dev"; git push;

# Create, enter and push stage branch
git switch -c stage; git switch stage; git push --set-upstream origin stage

# Add, commit and push files in branch stage
git merge dev; git add .; git commit -m "Create branch stage"; git push;

# Return main branch
git switch main; git merge stage; git add .; git commit -m "Merge branch stage"; git push; 