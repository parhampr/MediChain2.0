### Express server config: Replace values if stated

- PORT=8081
- HOST=localhost
- HOST_URL=http://localhost

### MongoDB Database URI: Replace values if stated

- DATABASE_URI={Database_Uri}
- COULD_DATABASE_STORAGE_URI={Storage_Uri}

### Network File Location Root: Replace values if stated

- ROOT_APP_DIR={path_to_folder_location}/medichain-back-end
- NETWORK_APP_DIR={path_to_folder_location}/medichain-back-end/HLFNetwork
- NETWORK_TEMPLATE_FOLDER=NetConfigTemplate
- PASSWORD={Root Password}
- GENERATE_CONFIG_FILE=./generateNetwork.sh

### Access Tokens: Use these values or replace with your own random values

ACCESS_TOKEN_SECRET=915693582dfb02a0114cdc8524804e351d7651e011360cac4e5a90e6f4abab344ca181611990bb0ccc2df4d690561f92ffd2d9a6fa7a7f045587dcf3f0565f04
REFRESH_ACCESS_TOKEN_SECRET=6d6e32a146167483a9a67ec08535dc87de10c16319d4caaa5f3d67fcd3e7a25a6d03ddee32f99e14475b2fbbf114c673014925e2a39433ba6d78360ddc85dc8a

### Docker Ports

The format for docker ports is P0_PORT_1:CA_PORT_1:COUCH_PORT_1|P0_PORT_2:CA_PORT_2:COUCH_PORT_2

Below are the sample ports you can include (4 hospital orgs each has 3 assigned ports)

- SERVER_PORTS=7051:7054:5984|9051:8054:7984|1051:1054:9984|2051:2054:8984
