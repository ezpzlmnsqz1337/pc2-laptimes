
ssh pi@malina 'cd /home/pi/workspace/laptimes/ && find . -mindepth 1 -not -path "./images/*" -not -path "./images" -exec rm -rf {} +'
rm -rf ./dist/images
scp -r ./dist/** pi@malina:/home/pi/workspace/laptimes/