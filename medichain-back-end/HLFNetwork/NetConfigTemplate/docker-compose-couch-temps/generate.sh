#!/bin/bash
function buildorg {
    sed -e "s/\${index}/$1/g" \
        -e "s/\${orgAdd}/$2/g" \
        -e "s/\${couchport}/$3/g" \
        -e "s/\${admin}/$4/g" \
        -e "s/\${adminpw}/$5/g" \
        -e "s/\${networknick}/$NETWORKNICK/g" \
        $CURR/couch-peer-temp.yaml | sed -e 's+^+  +'
}

function orgs {
    local total=""
    for index in "${!ORGANISATIONSADD[@]}"; do
        total+="$(buildorg ${index} ${ORGANISATIONSADD[$index]} ${COUCHPORT[$index]} ${ADMIN[$index]} ${PASSWORD[$index]})\n\n"
    done
    echo "$total"
}

function all {
    awk -v r="`orgs`" \
        -v nn="$NETWORKNAME" \
        -v nk="$NETWORKNICK" '{
        gsub(/\${couchdbservices}/,r);
        gsub(/\${networkname}/,nn);
        gsub(/\${networknick}/, nk);
        }3' $CURR/d-couch-temp.yaml | sed "s/example.com/$NETADD/g"
}

shopt -s xpg_echo
ORGANISATIONSADD=()
COUCHPORT=()
ADMIN=()
PASSWORD=()
while [[ $# -gt 0 ]]; do
  case $1 in
    -org|--organisation)
      while [[ "$1" == "-org" || "$1" == "--organisation" ]]; do
      ORGANISATIONSADD+=(`echo "$2" | tr [:upper:] [:lower:]`)
      COUCHPORT+=("$3")
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
echo "Generating docker-compose-couch.yaml in $NETDIR/docker"
echo "$(all)" > $NETDIR/docker/docker-compose-couch.yaml | mkdir -p $NETDIR/docker