#!/bin/bash
ORGANISATIONS=()
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
DIR="$NETDIR/organizations/cryptogen"
echo "Generating cryptogen files in $DIR"
mkdir -p $DIR && sed "s/example.com/$NETADD/g" $CURR/crypto-config-orderer.yaml > $DIR/crypto-config-orderer.yaml
for i in "${!ORGANISATIONS[@]}"; do
     awk -v org="${ORGANISATIONS[$i]}" \
         -v orgAdd="${ORGANISATIONSADD[$i]}" '{
            gsub(/\${org}/,org);
            gsub(/\${orgAdd}/,orgAdd);
         }2' $CURR/crypto-org-temp.yaml | sed "s/example.com/$NETADD/g" > $DIR/crypto-config-`echo "${ORGANISATIONS[$i]}" | tr [:upper:] [:lower:]`.yaml
done
