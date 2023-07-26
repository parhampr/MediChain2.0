#!/bin/bash
set -e

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1
starttime=$(date +%s)
CC_SRC_LANGUAGE=${1:-"javascript"}
CC_SRC_LANGUAGE=`echo "$CC_SRC_LANGUAGE" | tr [:upper:] [:lower:]`

if [ "$CC_SRC_LANGUAGE" = "javascript" ]; then
	CC_SRC_PATH="../../chaincode/"
else 
	echo The chaincode language ${CC_SRC_LANGUAGE} is not supported by this script
	echo Supported chaincode languages are: go, java, javascript, and typescript
	exit 1
fi

# clean out any old identites in the wallets
rm -rf /home/kamal/Code/MediChain2.0/medichain-back-end/app/wallet/*

# launch network; create channel and join peer to channel
exec > >(tee -i $PWD/logfile.txt)
exec 2>&1
pushd ../ApplicationNetwork
./network.sh down
docker volume prune -f
docker container prune -f
./network.sh up createChannel -ca -s couchdb
./network.sh deployCC -ccn medichain -ccv 1 -cci initLedger -ccl ${CC_SRC_LANGUAGE} -ccp ${CC_SRC_PATH}
popd
cat <<EOF
Total setup execution time : $(($(date +%s) - starttime)) secs ...
EOF
