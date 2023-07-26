function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $8)
    local CP=$(one_line_pem $9)
    sed -e "s/\${org}/$1/" \
        -e "s/\${sorg}/$2/" \
        -e "s/\${orgAdd}/$3/" \
        -e "s/\${admin}/$4/" \
        -e "s/\${adminpw}/$5/" \
        -e "s/\${P0PORT}/$6/" \
        -e "s/\${CAPORT}/$7/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        -e "s#\${networknick}#$NETWORKNICK#" \
        organizations/ccp-template.json
}

function yaml_ccp {
    local PP=$(one_line_pem $8)
    local CP=$(one_line_pem $9)
    sed -e "s/\${org}/$1/" \
        -e "s/\${sorg}/$2/" \
        -e "s/\${orgAdd}/$3/" \
        -e "s/\${admin}/$4/" \
        -e "s/\${adminpw}/$5/" \
        -e "s/\${P0PORT}/$6/" \
        -e "s/\${CAPORT}/$7/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        -e "s#\${networknick}#$NETWORKNICK#" \
        organizations/ccp-template.yaml | sed -e $'s/\\\\n/\\\n          /g'
}

function generateCCPs {
    local PEERPEM=organizations/peerOrganizations/$3/tlsca/tlsca.$3-cert.pem
    local CAPEM=organizations/peerOrganizations/$3/ca/ca.$3-cert.pem
    echo "$(json_ccp $1 $2 $3 $4 $5 $6 $7 $PEERPEM $CAPEM)" > organizations/peerOrganizations/$3/connection-`echo "$1" | tr [:upper:] [:lower:]`.json
    echo "$(yaml_ccp $1 $2 $3 $4 $5 $6 $7 $PEERPEM $CAPEM)" > organizations/peerOrganizations/$3/connection-`echo "$1" | tr [:upper:] [:lower:]`.yaml
}


#{networknick}
#{orgsgen}