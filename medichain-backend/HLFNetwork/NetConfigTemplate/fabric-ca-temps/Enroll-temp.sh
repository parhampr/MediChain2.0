function create#{org}() {
  infoln "Enrolling the CA admin"
  mkdir -p organizations/peerOrganizations/#{orgAdd}/

  export FABRIC_CA_CLIENT_HOME=${PWD}/organizations/peerOrganizations/#{orgAdd}/

  set -x
  fabric-ca-client enroll -u https://#{admin}:#{adminpw}@localhost:#{CAPORT} --caname ca-#{sorg} --tls.certfiles ${PWD}/organizations/fabric-ca/#{sorg}/tls-cert.pem
  { set +x; } 2>/dev/null

  echo 'NodeOUs:
  Enable: true
  ClientOUIdentifier:
    Certificate: cacerts/localhost-#{CAPORT}-ca-#{sorg}.pem
    OrganizationalUnitIdentifier: client
  PeerOUIdentifier:
    Certificate: cacerts/localhost-#{CAPORT}-ca-#{sorg}.pem
    OrganizationalUnitIdentifier: peer
  AdminOUIdentifier:
    Certificate: cacerts/localhost-#{CAPORT}-ca-#{sorg}.pem
    OrganizationalUnitIdentifier: admin
  OrdererOUIdentifier:
    Certificate: cacerts/localhost-#{CAPORT}-ca-#{sorg}.pem
    OrganizationalUnitIdentifier: orderer' >${PWD}/organizations/peerOrganizations/#{orgAdd}/msp/config.yaml

  infoln "Registering peer0"
  set -x
  fabric-ca-client register --caname ca-#{sorg} --id.name peer0 --id.secret peer0pw --id.type peer --tls.certfiles ${PWD}/organizations/fabric-ca/#{sorg}/tls-cert.pem
  { set +x; } 2>/dev/null

  infoln "Registering user"
  set -x
  fabric-ca-client register --caname ca-#{sorg} --id.name user1 --id.secret user1pw --id.type client --tls.certfiles ${PWD}/organizations/fabric-ca/#{sorg}/tls-cert.pem
  { set +x; } 2>/dev/null

  infoln "Registering the org admin"
  set -x
  fabric-ca-client register --caname ca-#{sorg} --id.name #{admin}admin --id.secret #{adminpw}adminpw --id.type admin --tls.certfiles ${PWD}/organizations/fabric-ca/#{sorg}/tls-cert.pem
  { set +x; } 2>/dev/null

  infoln "Generating the peer0 msp"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:#{CAPORT} --caname ca-#{sorg} -M ${PWD}/organizations/peerOrganizations/#{orgAdd}/peers/peer0.#{orgAdd}/msp --csr.hosts peer0.#{orgAdd} --tls.certfiles ${PWD}/organizations/fabric-ca/#{sorg}/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/peerOrganizations/#{orgAdd}/msp/config.yaml ${PWD}/organizations/peerOrganizations/#{orgAdd}/peers/peer0.#{orgAdd}/msp/config.yaml

  infoln "Generating the peer0-tls certificates"
  set -x
  fabric-ca-client enroll -u https://peer0:peer0pw@localhost:#{CAPORT} --caname ca-#{sorg} -M ${PWD}/organizations/peerOrganizations/#{orgAdd}/peers/peer0.#{orgAdd}/tls --enrollment.profile tls --csr.hosts peer0.#{orgAdd} --csr.hosts localhost --tls.certfiles ${PWD}/organizations/fabric-ca/#{sorg}/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/peerOrganizations/#{orgAdd}/peers/peer0.#{orgAdd}/tls/tlscacerts/* ${PWD}/organizations/peerOrganizations/#{orgAdd}/peers/peer0.#{orgAdd}/tls/ca.crt
  cp ${PWD}/organizations/peerOrganizations/#{orgAdd}/peers/peer0.#{orgAdd}/tls/signcerts/* ${PWD}/organizations/peerOrganizations/#{orgAdd}/peers/peer0.#{orgAdd}/tls/server.crt
  cp ${PWD}/organizations/peerOrganizations/#{orgAdd}/peers/peer0.#{orgAdd}/tls/keystore/* ${PWD}/organizations/peerOrganizations/#{orgAdd}/peers/peer0.#{orgAdd}/tls/server.key

  mkdir -p ${PWD}/organizations/peerOrganizations/#{orgAdd}/msp/tlscacerts
  cp ${PWD}/organizations/peerOrganizations/#{orgAdd}/peers/peer0.#{orgAdd}/tls/tlscacerts/* ${PWD}/organizations/peerOrganizations/#{orgAdd}/msp/tlscacerts/ca.crt

  mkdir -p ${PWD}/organizations/peerOrganizations/#{orgAdd}/tlsca
  cp ${PWD}/organizations/peerOrganizations/#{orgAdd}/peers/peer0.#{orgAdd}/tls/tlscacerts/* ${PWD}/organizations/peerOrganizations/#{orgAdd}/tlsca/tlsca.#{orgAdd}-cert.pem

  mkdir -p ${PWD}/organizations/peerOrganizations/#{orgAdd}/ca
  cp ${PWD}/organizations/peerOrganizations/#{orgAdd}/peers/peer0.#{orgAdd}/msp/cacerts/* ${PWD}/organizations/peerOrganizations/#{orgAdd}/ca/ca.#{orgAdd}-cert.pem

  infoln "Generating the user msp"
  set -x
  fabric-ca-client enroll -u https://user1:user1pw@localhost:#{CAPORT} --caname ca-#{sorg} -M ${PWD}/organizations/peerOrganizations/#{orgAdd}/users/User1@#{orgAdd}/msp --tls.certfiles ${PWD}/organizations/fabric-ca/#{sorg}/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/peerOrganizations/#{orgAdd}/msp/config.yaml ${PWD}/organizations/peerOrganizations/#{orgAdd}/users/User1@#{orgAdd}/msp/config.yaml

  infoln "Generating the org admin msp"
  set -x
  fabric-ca-client enroll -u https://#{admin}admin:#{adminpw}adminpw@localhost:#{CAPORT} --caname ca-#{sorg} -M ${PWD}/organizations/peerOrganizations/#{orgAdd}/users/Admin@#{orgAdd}/msp --tls.certfiles ${PWD}/organizations/fabric-ca/#{sorg}/tls-cert.pem
  { set +x; } 2>/dev/null

  cp ${PWD}/organizations/peerOrganizations/#{orgAdd}/msp/config.yaml ${PWD}/organizations/peerOrganizations/#{orgAdd}/users/Admin@#{orgAdd}/msp/config.yaml
}
