# run script with sudo
if [ "$EUID" -ne 0 ]
  then echo "Please make sure you run script with root access"
  exit
fi
service docker --full-restart

# Update the clock
ntpdate time.windows.com

# install a global package
package='concurrently'
if [ `npm list -g | grep -c $package` -eq 0 ]; then
    npm install -g $package
fi
concurrently "npm run start --prefix medichain-front-end" "npm run start-server --prefix medichain-back-end"
