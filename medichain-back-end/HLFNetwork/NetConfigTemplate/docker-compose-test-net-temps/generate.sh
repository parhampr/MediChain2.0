#!/bin/bash
function buildorg {
    sed -e "s/\${org}/$1/g" \
        -e "s/\${orgAdd}/$2/g" \
        -e "s/\${peerport}/$3/g" \
        -e "s/\${peerportnext}/$(( $3 + 1 ))/g" \
        $CURR/peer-image.yaml | sed -e 's+^+  +'
}

function orgs {
    local total=""
    for index in "${!ORGANISATIONS[@]}"; do
        total+="$(buildorg ${ORGANISATIONS[$index]} ${ORGANISATIONSADD[$index]} ${PEERPORT[$index]})\n\n"
    done
    echo "$total"
}

function list {
    local total=""
    for index in "${!ORGANISATIONS[@]}"; do
        total+="peer0.${ORGANISATIONSADD[$index]}:\n"
    done
    echo "$total" | sed -e 's+^+  +'
}

function list2 {
   local total=""
    for index in "${!ORGANISATIONS[@]}"; do
        total+="      - peer0.${ORGANISATIONSADD[$index]}\n"
    done
    echo "$total"
}

function all {
    awk -v r="`orgs`" \
        -v nn="$NETWORKNAME" \
        -v cli="`list2`" \
        -v w="`list`" '{
        gsub(/\${peervolumes}/,r);
        gsub(/\${peerlist}/,w);
        gsub(/\${networkname}/,nn);
        gsub(/\${clilist}/,cli);
        }3' $CURR/d-compose-test-net.yaml | sed -e "s+\${networknick}+${NETWORKNICK}+g" -e "s/example.com/$NETADD/g"
}

shopt -s xpg_echo
ORGANISATIONS=()
ORGANISATIONSADD=()
PEERPORT=()
while [[ $# -gt 0 ]]; do
  case $1 in
    -org|--organisation)
      while [[ "$1" == "-org" || "$1" == "--organisation" ]]; do
      ORGANISATIONS+=("$2")
      ORGANISATIONSADD+=(`echo "$3" | tr [:upper:] [:lower:]`)
      PEERPORT+=("$4")
      shift 4 # past argument
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


echo "Generating docker-compose-test-net.yaml in $NETDIR/docker"
echo "$(all)" > $NETDIR/docker/docker-compose-test-net.yaml | mkdir -p $NETDIR/docker