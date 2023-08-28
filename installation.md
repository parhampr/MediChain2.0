## Pre-requisites

Before beginning, developers should confirm that they have installed all the prerequisites below on the platform where HLF framework will run

- [Install Git](https://git-scm.com/downloads)
- [Install cURL](https://curl.se/download.html)
- [Install Docker On Ubuntu](https://docs.docker.com/engine/install/ubuntu/) OR Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

Check docker version using the command `docker --version`

## Install Docker Binaries & Images

Run the following command to install docker binaries and images.

`curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.2.0 1.5.2`

Following binaries should be installed and stored inside medichain-backend folder (within bin folder)

- configtxgen,
- configtxlator,
- cryptogen,
- discover,
- idemixgen
- orderer,
- peer,
- fabric-ca-client,
- fabric-ca-server

Specify the bin folder path in global variable

`export PATH=<path to folder location>/medichain-backend/bin:$PATH`

## Conclusion

The installation is a bit tricky. Please take care of the versions installed between docker images and local binaries. If everything is ready then proceed to [Usage.md](usage.md).
