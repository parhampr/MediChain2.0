#!/bin/bash
function CreateOrg {
    local total=""
    for i in "${ORGANISATIONS[@]}"; do
     total+="infoln \"Creating ${i} Identities\"\n    create${i}\n\n"
    done
    echo "$total"
}

function dockerDown {
    local total=""
     for i in "${SORG[@]}"; do
     total+="docker run --rm -v \$(pwd):/data busybox sh -c 'cd /data && rm -rf organizations/fabric-ca/${i}/msp organizations/fabric-ca/${i}/tls-cert.pem organizations/fabric-ca/${i}/ca-cert.pem organizations/fabric-ca/${i}/IssuerPublicKey organizations/fabric-ca/${i}/IssuerRevocationPublicKey organizations/fabric-ca/${i}/fabric-ca-server.db'\n    "
    done
    echo "$total"
}

function CreateJoinOrg {
    local total=""
    for i in "${ORGANISATIONS[@]}"; do
     total+="infoln \"Joining ${i} peer to the channel...\"\n    joinChannel ${i}\n\n"
    done
    echo "$total"
}

function CreateSetAnchor {
    local total=""
    for i in "${ORGANISATIONS[@]}"; do
     total+="infoln \"Setting anchor peer for  ${i} ...\"\n    setAnchorPeer ${i}\n\n"
    done
    echo "$total"
}

function CreateNumberOfOrganisation {
  local total=""
  local index=0
  for i in "${!ORGANISATIONS[@]}"; do 
    index=$((${#ORGANISATIONS[@]}*$1+$i))
    total+="\x22#{}\x22${ORGANISATIONS[$i]}MSP#{}\x22: ${truefalse[$index]}\x22 "
  done
  echo "$total"
}
function CreateCommitReadiness {
  local total=""
  for i in "${ORGANISATIONS[@]}"; do 
  total+="
  checkCommitReadiness $i `CreateNumberOfOrganisation $1`"
  done
  echo "$total"
}

function CreateChaincodeOrgs {
  local total=""
  for i in "${ORGANISATIONS[@]}"; do 
  total+="
  infoln \"Installing chaincode on peer0.`echo "$i" | tr [:upper:] [:lower:]`...\"
  installChaincode $i
  "
  done
  total+="queryInstalled ${ORGANISATIONS[0]}"
  for i in "${!ORGANISATIONS[@]}"; do
  total+="
  ## approve the definition for ${ORGANISATIONS[$i]}
  approveForMyOrg ${ORGANISATIONS[$i]}
  ## check whether the chaincode definition is ready to be committed
  `CreateCommitReadiness $i`
  "
  done

  total+="  
  ## now that we know for sure both orgs have approved, commit the definition
  commitChaincodeDefinition `printf '%s ' "${ORGANISATIONS[@]}"`
  "

  for i in "${ORGANISATIONS[@]}"; do
  total+="\n  queryCommitted $i"
  done

  total+="
  if [ \"\$CC_INIT_FCN\" = \"NA\" ]; then
  infoln \"Chaincode initialization is not required\"
  else
  chaincodeInvokeInit `printf '%s ' "${ORGANISATIONS[@]}"`
  fi
  "
  echo "$total"
  # HERERE LEFT
}

function CreateExports {
  local total=""
  for i in "${!ORGANISATIONS[@]}"; do
  total+="export PEER0_`echo "${ORGANISATIONS[$i]}" | tr [:lower:] [:upper:]`_CA=\${PWD}/organizations/peerOrganizations/${ORGANISATIONSADD[$i]}/peers/peer0.${ORGANISATIONSADD[$i]}/tls/ca.crt\n"
  done
  echo "$total"
}

function CreateSetGlobals { 
  local total=""
  for i in "${!ORGANISATIONS[@]}"; do
  if [ $i -eq 0 ]; then
  total+="\n  if "
  else
  total+="\n  elif "
  fi
  total+="[ \$USING_ORG == \"${ORGANISATIONS[$i]}\" ]; then
    export CORE_PEER_LOCALMSPID=\"${ORGANISATIONS[$i]}MSP\"
    export CORE_PEER_TLS_ROOTCERT_FILE=\$PEER0_`echo "${ORGANISATIONS[$i]}" | tr [:lower:] [:upper:]`_CA
    export CORE_PEER_MSPCONFIGPATH=\${PWD}/organizations/peerOrganizations/${ORGANISATIONSADD[$i]}/users/Admin@${ORGANISATIONSADD[$i]}/msp
    export CORE_PEER_ADDRESS=localhost:${P0PORT[$i]}"
  done
  total+="\n  else
  errorln \"ORG Unknown\"
  fi
  "
  echo "$total"
}

function CreateSetsGlobalCLI {
  for i in "${!ORGANISATIONS[@]}"; do
  if [ $i -eq 0 ]; then
  total+="\n  if "
  else
  total+="\n  elif "
  fi
  total+="[ \$USING_ORG == \"${ORGANISATIONS[$i]}\" ]; then
  export CORE_PEER_ADDRESS=peer0.${ORGANISATIONSADD[$i]}:${P0PORT[$i]}"
  done
  total+="\n  else
  errorln \"ORG Unknown\"
  fi
  "
  echo "$total"
}

function CreateAnchorf {
  for i in "${!ORGANISATIONS[@]}"; do
  if [ $i -eq 0 ]; then
  total+="\n  if "
  else
  total+="\n  elif "
  fi
  total+="[ \$ORG == \"${ORGANISATIONS[$i]}\" ]; then
   HOST=\"peer0.${ORGANISATIONSADD[$i]}\"
   PORT=${P0PORT[$i]}"
  done
  total+="\n  else
  errorln \"ORG Unknown\"
  fi
  "
  echo "$total"
}

# Generate Network File
function generateNetworksh {
    awk -v ORG="$(CreateOrg)" \
        -v DOCKERDOWN="$(dockerDown)" \
        -v first="${SORG[0]}" '{
            gsub(/#{createorgs}/,ORG);
            gsub(/#{dockerdownfunctions}/,DOCKERDOWN);
            gsub(/#{firstorg}/,first);
        }3' $CURR/network-temp.sh | sed 's/#{dockerdownfunctions}/\&/g'  > $NETDIR/../network.sh
}

# Generate Config Update file
function generateConfigU {
    sed "s/example.com/$NETADD/g" $CURR/configUpdate-temp.sh > $NETDIR/configUpdate.sh
}

# Generate create channel file
function generateCreateChannel {
    awk -v JOIN="$(CreateJoinOrg)" \
        -v ANCHOR="$(CreateSetAnchor)" \
        -v first="${ORGANISATIONS[0]}" '{
            gsub(/#{joinorg}/,JOIN);
            gsub(/#{setanchororg}/,ANCHOR);
            gsub(/#{firstorg}/, first)
        }2' $CURR/createChannel-temp.sh | sed "s/example.com/$NETADD/g"  > $NETDIR/createChannel.sh
}

# Generate DeployCC file
function generateDeployCC {
  awk -v JOIN="$(CreateChaincodeOrgs)" '{
            gsub(/#{installchaincode}/,JOIN);
        }2' $CURR/deployCC-temp.sh | sed "s/example.com/$NETADD/g"  > $NETDIR/deployCC.sh
  sed -i 's+#{}+\\+g' $NETDIR/deployCC.sh 
}

# Generate EnvVar file
function generateEnvVar {
  awk -v EXP="$(CreateExports)" \
      -v SETG="`CreateSetGlobals`" \
      -v SETGCLI="`CreateSetsGlobalCLI`" '{
            gsub(/#{exports}/,EXP);
            gsub(/#{setglobals}/,SETG);
            gsub(/#{setglobalcli}/,SETGCLI);
        }2' $CURR/envVar-temp.sh | sed "s/example.com/$NETADD/g"  > $NETDIR/envVar.sh
}

# Generate setAnchorPeer file
function generateSetAnchorPeer {
   awk -v AF="$(CreateAnchorf)" '{
            gsub(/#{anchorf}/,AF);
        }2' $CURR/setAnchorPeer-temp.sh | sed "s/example.com/$NETADD/g"  > $NETDIR/setAnchorPeer.sh
}

function all {
  echo "Generating Network sh file"
  generateNetworksh
  echo "Generating ConfigUpdate sh file"
  generateConfigU
  echo "Generating CreateChannel sh file"
  generateCreateChannel
  echo "Generating DeployCC sh file"
  generateDeployCC
  echo "Generating envVar sh file"
  generateEnvVar
  echo "Generating setAnchorPeer sh file"
  generateSetAnchorPeer
}

shopt -s xpg_echo
ORGANISATIONS=()
SORG=()
ORGANISATIONSADD=()
P0PORT=()
while [[ $# -gt 0 ]]; do
  case $1 in
    -org|--organisation)
      ORGANISATIONS+=("$2")
      SORG+=(`echo "$2" | tr [:upper:] [:lower:]`)
      ORGANISATIONSADD+=(`echo "$3" | tr [:upper:] [:lower:]`)
      P0PORT+=("$4")
      shift 4 # past argument
      ;;
    --default)
      exit 1
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

declare -a truefalse=()
if [ "${#ORGANISATIONS[@]}" -eq "1" ]; then
truefalse+=("true")
elif [ "${#ORGANISATIONS[@]}" -eq "2" ]; then
truefalse+=("true" "false")
truefalse+=("true" "true")
elif [ "${#ORGANISATIONS[@]}" -eq "3" ]; then
truefalse+=("true" "false" "false")
truefalse+=("true" "true" "false")
truefalse+=("true" "true" "true")
elif [ "${#ORGANISATIONS[@]}" -eq "4" ]; then
truefalse+=("true" "false" "false" "false")
truefalse+=("true" "true" "false" "false")
truefalse+=("true" "true" "true" "false")
truefalse+=("true" "true" "true" "true")
else
echo 'Maximum Organisations reached'
exit 1
fi
mkdir -p $NETDIR/scripts/
NETDIR=$NETDIR/scripts
cp -u $CURR/utils.sh $NETDIR
all
mkdir -p $NETDIR/../system-genesis-block
gitignore="
/channel-artifacts/*.tx
/channel-artifacts/*.block
/ledgers
/ledgers-backup
/channel-artifacts/*.json
/org3-artifacts/crypto-config/*
organizations/fabric-ca/ordererOrg/*"
for i in "${ORGANISATIONS[@]}"; do
  gitignore+="organizations/fabric-ca/$i/* \n"
done
gitignore+="organizations/ordererOrganizations/*
organizations/peerOrganizations/*
system-genesis-block/*
*.tar.gz
log.txt"
echo "$gitignore" > $NETDIR/../.gitignore
chmod +x $NETDIR/*.sh
chmod +x $NETDIR/../*.sh
cp -r $CURR/addOrg3 $NETDIR/../