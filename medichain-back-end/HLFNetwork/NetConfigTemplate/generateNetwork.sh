#!/bin/bash
C_YELLOW='\033[1;33m'
C_RESET='\033[0m'
C_GREEN='\033[0;32m'
C_BLUE='\033[0;34m'

shopt -s xpg_echo
function println() {
  echo -e "$1"
}

function infoln() {
  println "${C_YELLOW}${1}${C_RESET}"
}

# successln echos in green color
function successln() {
  println "${C_GREEN}${1}${C_RESET}"
}

# infoln echos in blue color
function informationln() {
  println "${C_BLUE}${1}${C_RESET}"
}

function configtxO {
    local total=""
    for i in "${!ORGANISATIONS[@]}"; do
    total+="-org ${ORGANISATIONS[$i]} ${ORGANISATIONSADD[$i]} "
    done
    echo "$total"
}

function composeCa {
    local total=""
    for i in "${!ORGANISATIONS[@]}"; do
    total+="-org ${ORGANISATIONS[$i]} ${CAPORT[$i]} ${ADMIN[$i]} ${PASSWORD[$i]}\t"
    done
    echo "$total"
}

function couch {
    local total=""
    for i in "${!ORGANISATIONS[@]}"; do
    total+="-org ${ORGANISATIONSADD[$i]} ${COUCHPORT[$i]} ${ADMIN[$i]} ${PASSWORD[$i]}\t"
    done
    echo "$total"
}

function testNetO {
    local total=""
    for i in "${!ORGANISATIONS[@]}"; do
    total+="-org ${ORGANISATIONS[$i]} ${ORGANISATIONSADD[$i]} ${P0PORT[$i]}\t"
    done
    echo "$total"
}

function fabric {
    local total=""
    for i in "${!ORGANISATIONS[@]}"; do
    total+="-org ${ORGANISATIONS[$i]} ${ORGANISATIONSADD[$i]} ${ADMIN[$i]} ${PASSWORD[$i]} \"${COUNTRY[$i]}\" \"${STATE[$i]}\" \"${LOCATION[$i]}\" ${P0PORT[$i]} ${CAPORT[$i]}\t"
    done
    echo "$total"
}

NETDIR="../../ApplicationNetwork"
NETADD="um.edu.my"
NETWORKNAME="Medi_Chain"
NETWORKNICK="mdc"
ORGANISATIONS=()
ORGANISATIONSADD=()
ADMIN=()
PASSWORD=()
COUNTRY=()
STATE=()
LOCATION=()
P0PORT=()
CAPORT=()
COUCHPORT=()
while [[ $# -gt 0 ]]; do
  case $1 in
    -netName|--networkname)
    NETWORKNAME="$2"
    shift 2
    ;;
    -netAdd|--networkAddress)
    NETADD="$2"
    shift 2
    ;;
    -netID|--networkID)
    NETWORKNICK="$2"
    shift 2
    ;;
    -org|--organisation)
      if [ "$NETADD" == "" ]; then
      infoln "No network address provided...defaulting to $NETADD"
      fi
      while [[ "$1" == "-org" || "$1" == "--organisation" ]]; do
      ORGANISATIONS+=("$2")
      ORGANISATIONSADD+=(`echo "$2.$NETADD" | tr [:upper:] [:lower:]`)
      ADMIN+=("$3")
      PASSWORD+=("$4")
      COUNTRY+=(`echo ${5// /#{S\}}`)
      STATE+=(`echo ${6// /#{S\}}`)
      LOCATION+=(`echo ${7// /#{S\}}`)
      P0PORT+=("$8")
      CAPORT+=("$9")
      COUCHPORT+=("${10}")
      shift 10 # past argument
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
mkdir -p $NETDIR
export NETDIR
export NETADD
export NETWORKNAME
export NETWORKNICK
infoln "
BUILDING CONFIGURATION FOR: "

informationln "  NETWORK NAME:      $NETWORKNAME,
  NETWORK ID:        $NETWORKNICK,
  NETWORK DIRECTORY: $NETDIR,
  NETWORK ADDRESS:   $NETADD
"
infoln "ORGANISATION DETAILS "
for i in "${!ORGANISATIONS[@]}"; do
informationln "  Organisation $(($i + 1)):"
informationln "  Organisation Name:     ${ORGANISATIONS[$i]},
  Organisation PeerP:    ${P0PORT[$i]},
  Organisation CAPort:   ${CAPORT[$i]}
  Organisation ADMIN:    ${ADMIN[$i]},
  Organisation PASSWORD: ${PASSWORD[$i]:0:2}***
  "
done
infoln "Verbose - "
export CURR="$PWD/configtx-temp"
configtx-temp/generate.sh $(configtxO)

export CURR="$PWD/cryptogen-temp"
cryptogen-temp/generate.sh $(configtxO)

export CURR="$PWD/docker-compose-ca-temps"
docker-compose-ca-temps/generate.sh $(composeCa)

export CURR="$PWD/docker-compose-couch-temps"
docker-compose-couch-temps/generate.sh $(couch)

export CURR="$PWD/docker-compose-test-net-temps"
docker-compose-test-net-temps/generate.sh $(testNetO)

export CURR="$PWD/fabric-ca-temps"
fabric-ca-temps/generate.sh $(fabric)

export CURR="$PWD/generateScripts-temps"
generateScripts-temps/generate.sh $(testNetO)

successln "\nSuccessfully generated the network config in $NETDIR"
exit 0