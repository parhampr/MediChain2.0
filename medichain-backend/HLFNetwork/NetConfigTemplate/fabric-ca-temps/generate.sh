#!/bin/bash
function ordererorg {
  awk -v r="$NETADD" '{
    gsub(/\${ordererAdd}/,r);
  }1' $CURR/fabric-ca-server-config.yaml
}

function genBash {
  awk -v org="$1" \
      -v orgAdd="$2" \
      -v admin="$3" \
      -v password="$4" \
      -v sorg="`echo "$1" | tr [:upper:] [:lower:]`" \
      -v caport="$5" '{
          gsub(/#{org}/,org);
          gsub(/#{orgAdd}/,orgAdd);
          gsub(/#{admin}/,admin);
          gsub(/#{adminpw}/,password);
          gsub(/#{sorg}/,sorg);
          gsub(/#{CAPORT}/, caport)
      }3' <$CURR/Enroll-temp.sh
}

function ccp {
  echo "
ORGANISATIONS=\"$1\"
SORG=\"$2\"
ORGANISATIONSADD=\"$3\"
ADMIN=\"$4\"
PASSWORD=\"$5\"
P0PORT=\"$6\"
CAPORT=\"$7\"
generateCCPs \$ORGANISATIONS \$SORG \$ORGANISATIONSADD \$ADMIN \$PASSWORD \$P0PORT \$CAPORT
"
}

shopt -s xpg_echo
ORGANISATIONS=()
ORGANISATIONSADD=()
ADMIN=()
PASSWORD=()
COUNTRY=()
STATE=()
LOCATION=()
P0PORT=()
CAPORT=()
while [[ $# -gt 0 ]]; do
  case $1 in
    -org|--organisation)
      while [[ "$1" == "-org" || "$1" == "--organisation" ]]; do
      ORGANISATIONS+=("$2")
      ORGANISATIONSADD+=(`echo "$3" | tr [:upper:] [:lower:]`)
      SORG+=(`echo "$2" | tr [:upper:] [:lower:]`)
      ADMIN+=("$4")
      PASSWORD+=("$5")
      COUNTRY+=("$6")
      STATE+=("$7")
      LOCATION+=("$8")
      P0PORT+=("$9")
      CAPORT+=("${10}")
      shift 10 # past argument
      done
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

DIR="$NETDIR/organizations/fabric-ca"
mkdir -p $DIR/ordererOrg/ && echo "$(ordererorg)" > $DIR/ordererOrg/fabric-ca-server-config.yaml
cp -u $CURR/ccp-generate.sh $CURR/ccp-template.json $CURR/ccp-template.yaml $DIR/../
echo "Generating Organization Fabric CA files in $DIR"
for i in "${!ORGANISATIONS[@]}"; do
     mkdir -p $DIR/${SORG[$i]}/
     echo "Generating Organization ${ORGANISATIONS[$i]} Fabric CA config"
     awk -v org="${ORGANISATIONS[$i]}" \
         -v orgAdd="${ORGANISATIONSADD[$i]}" \
         -v admin="${ADMIN[$i]}" \
         -v password="${PASSWORD[$i]}" \
         -v country="`echo ${COUNTRY[$i]} | sed 's/"/\\"/g'`" \
         -v state="`echo ${STATE[$i]} | sed 's/"/\\"/g'`" \
         -v location="`echo ${LOCATION[$i]} | sed 's/"/\\"/g'`" '{
            gsub(/\${org}/,org);
            gsub(/\${orgAdd}/,orgAdd);
            gsub(/\${admin}/,admin);
            gsub(/\${adminpw}/,password);
            gsub(/\${country}/,country);
            gsub(/\${state}/,state);
            gsub(/\${location}/,location);
         }2' $CURR/ca-server-template.yaml | sed "s+#{S}+ +g" > $DIR/${SORG[$i]}/fabric-ca-server-config.yaml
  done

total="#!/bin/bash \n"
ccpgenerate=""
for i in "${!ORGANISATIONS[@]}"; do
     total+="$(genBash ${ORGANISATIONS[$i]} ${ORGANISATIONSADD[$i]} ${ADMIN[$i]} ${PASSWORD[$i]} ${CAPORT[$i]})\n\n"
     ccpgenerate+="$(ccp ${ORGANISATIONS[$i]} ${SORG[$i]} ${ORGANISATIONSADD[$i]} ${ADMIN[$i]} ${PASSWORD[$i]} ${P0PORT[$i]} ${CAPORT[$i]})\n\n"
done

awk -i inplace -v org="$ccpgenerate" \
    -v networknick="NETWORKNICK=\"$NETWORKNICK\"" '{
            gsub(/#{orgsgen}/,org);
            gsub(/#{networknick}/,networknick);
         }2' $DIR/../ccp-generate.sh

total+="$(cat $CURR/ordererbash.txt)"
echo "Generating registerEnroll.sh in $DIR"
echo "$total" | sed "s/example.com/$NETADD/g" > $DIR/registerEnroll.sh
chmod +x $DIR/registerEnroll.sh




