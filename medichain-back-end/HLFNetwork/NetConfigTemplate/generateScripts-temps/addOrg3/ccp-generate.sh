#!/bin/bash

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $6)
    local CP=$(one_line_pem $7)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${ADMINUSERID}/$2/" \
        -e "s/\${ADMINUSERPASSWD}/$3/" \
        -e "s/\${P0PORT}/$4/" \
        -e "s/\${CAPORT}/$5/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        ccp-template.json
}

function yaml_ccp {
    local PP=$(one_line_pem $6)
    local CP=$(one_line_pem $7)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${ADMINUSERID}/$2/" \
        -e "s/\${ADMINUSERPASSWD}/$3/" \
        -e "s/\${P0PORT}/$4/" \
        -e "s/\${CAPORT}/$5/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        ccp-template.yaml | sed -e $'s/\\\\n/\\\n        /g'
}

ORG=3
ADMINUSERID="CAsura"
ADMINUSERPASSWD="CAsurapw"
P0PORT=11051
CAPORT=11054
PEERPEM=../organizations/peerOrganizations/org3.example.com/tlsca/tlsca.org3.example.com-cert.pem
CAPEM=../organizations/peerOrganizations/org3.example.com/ca/ca.org3.example.com-cert.pem

echo "$(json_ccp $ORG $ADMINUSERID $ADMINUSERPASSWD $P0PORT $CAPORT $PEERPEM $CAPEM)" > ../organizations/peerOrganizations/org3.example.com/connection-org3.json
echo "$(yaml_ccp $ORG $ADMINUSERID $ADMINUSERPASSWD $P0PORT $CAPORT $PEERPEM $CAPEM)" > ../organizations/peerOrganizations/org3.example.com/connection-org3.yaml
