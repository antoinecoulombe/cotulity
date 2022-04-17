readonly cov="./coverage"

# Create coverage folder
if [ ! -d ${cov} ];
then
    mkdir "coverage"
    echo "Created coverage folder.\n"
fi

# For each folder in API
for d in ./api/*/ ; do
  echo " "
  service=$(basename $d)
  covService="${cov}/${service}"

  # If the folder doesn't exist in the coverage directory
  if [ ! -d ${covService} ]
  then
    mkdir $covService
    echo "Created '${covService}' folder."
    echo "Copying all files from '${d}' to '${covService}'..."
    cp -R ${d}/. ${covService}/ # Copy all files
    continue
  fi

  # If the service folder exists

  # Check if modules have changed
  sameModules=$(cmp -s $d/package.json $covService/package.json)

  # If the modules have changed
  if [ ! sameModules ] || [ ! -d "${covService}/node_modules" ]
  then
    echo "The 'package.json' for '${service}' was modified. The 'node_modules' folder will be updated."
    echo "Removing all files from '${covService}'..."
    rm -rf $covService/* # Remove all files from coverage service folder
    echo "Copying all files from '${d}' to '${covService}'..."
    cp -R ${d}/. ${covService}/ # Copy all files
  else 
    echo "The 'package.json' file for '${service}' was not modified. Only the 'src' folder will be updated."
    echo "Removing 'src' folder and its contents..."
    rm -rf $covService/src
    echo "Copying all files from '${d}src' to '${covService}/src'..."
    cp -R ${d}/src ${covService}/src
  fi
done