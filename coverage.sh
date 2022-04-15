readonly cov="./coverage"

# Create coverage folder
if [ ! -d ${cov} ];
then
    mkdir "coverage"
fi

# For each folder in API
for d in ./api/*/ ; do
  service=$(basename $d)
  covService="${cov}/${service}"

  # If the folder doesn't exist in the coverage directory
  if [ ! -d ${covService} ]
  then
    cp -R ${d}/. ${covService}/ # Copy all files
    continue
  fi

  # If the service folder exists

  # Check if modules have changed
  sameModules=$(cmp -s $d/package.json $covService/package.json)

  # If the modules have changed
  if [ ! sameModules ] || [ ! -d "${covService}/node_modules" ]
  then
    echo "MODULES CHANGED OR NOT FOUND"
    rm -rf $covService/* # Remove all files from coverage service folder
    cp -R ${d}/. ${covService}/ # Copy all files
  else 
    echo "MODULES NOT CHANGED"
    rm -rf $covService/!(node_modules) # delete everything except node_modules
    # cp -R "$d/!(node_modules)" ${covService}/ # copy everything except node_modules
  fi
done