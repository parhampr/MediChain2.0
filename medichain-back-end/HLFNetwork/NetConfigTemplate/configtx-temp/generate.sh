#!/bin/bash
function spaces {
    if [[ $1 == "4" ]]
    then
    echo "\n    "
    else
    echo "\n                "
    fi
}
function buildorg {
    sed -e "s/\${org}/$1/g" \
        -e "s/\${orgID}/$2/g" \
        -e "s/\${orgAdd}/$3/g" \
        $CURR/organisation-template.yaml
}

function orgs {
    local total=""
    local s="4"
    for index in "${!ORGANISATIONS[@]}"; do
        total+="$(buildorg ${ORGANISATIONS[$index]} ${ORGID[$index]} ${ORGANISATIONSADD[$index]}) `spaces $s`"
    done
    echo "$total"
}
function list {
    local item=""
    local space="16"
    for i in "${ORGANISATIONS[@]}"; do
        item+="- *${i} `spaces $space`"
    done
    echo "$item"
}

function all {
    awk -v r="`orgs`" \
        -v w="$(list)" '{
        gsub(/\${organisations}/,r);
        gsub(/\${organisationprofiles}/,w);
        }2' $CURR/configtx-temp.yaml | sed -e 's/\${organisations}/\&/g' \
                                     -e "s/example.com/$NETADD/g"
}

shopt -s xpg_echo
ORGANISATIONS=()
ORGID=()
ORGANISATIONSADD=()
while [[ $# -gt 0 ]]; do
  case $1 in
    -org|--organisation)
      while [[ "$1" == "-org" || "$1" == "--organisation" ]]; do
      ORGANISATIONS+=("$2")
      ORGANISATIONSADD+=(`echo "$3" | tr [:upper:] [:lower:]`)
      shift 3
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

for i in "${ORGANISATIONS[@]}"; do
   ORGID+=("\&$i")
done
echo "Generating configtx.yaml in $NETDIR/configtx"
echo "$(all)" > $NETDIR/configtx/configtx.yaml | mkdir -p $NETDIR/configtx
