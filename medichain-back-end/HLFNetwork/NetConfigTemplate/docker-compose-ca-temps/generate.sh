#!/bin/bash
function buildorg {
    sed -e "s/\${org}/$1/g" \
        -e "s/\${caport}/$2/g" \
        -e "s/\${admin}/$3/g" \
        -e "s/\${adminpw}/$4/g" \
        -e "s/\${networknick}/$5/g" \
        $CURR/ca-org-temp.yaml | sed -e 's+^+  +'
}

function orgs {
    local total=""
    for index in "${!ORGANISATIONS[@]}"; do
        total+="$(buildorg ${ORGANISATIONS[$index]} ${ORGANISATIONSPORT[$index]} ${ADMIN[$index]} ${PASSWORD[$index]} $NETWORKNICK)"
        total+="\n\n"
    done
    echo "$total"
}

function all {
    awk -v r="`orgs`" \
        -v nn="$NETWORKNAME" \
        -v nk="$NETWORKNICK" '{
        gsub(/\${CAorganisation}/,r);
        gsub(/\${networkname}/,nn);
        gsub(/\${networknick}/,nk);
        }3' $CURR/d-compose-ca-temp.yaml | sed "s/example.com/$NETADD/g"
}


shopt -s xpg_echo
ORGANISATIONS=()
ORGANISATIONSPORT=()
ADMIN=()
PASSWORD=()
while [[ $# -gt 0 ]]; do
  case $1 in
    -org|--organisation)
      while [[ "$1" == "-org" || "$1" == "--organisation" ]]; do
      ORGANISATIONS+=(`echo "$2" | tr [:upper:] [:lower:]`)
      ORGANISATIONSPORT+=("$3")
      ADMIN+=("$4")
      PASSWORD+=("$5")
      shift 5 # past argument
      done
      ;;
    --default)
      shift # past argument
      ;;
    -*|--*)
      echo "Unknown option $1"
      exit 1
      ;;
    *)
      shift # past argument
      ;;
  esac
done

echo "Creating docker-compose-ca in $NETDIR/docker" 
echo "Generating docker-compose-ca.yaml in $NETDIR/docker"
echo "$(all)" > $NETDIR/docker/docker-compose-ca.yaml | mkdir -p $NETDIR/docker
