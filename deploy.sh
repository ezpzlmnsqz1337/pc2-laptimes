#!/bin/bash -i

shopt -s expand_aliases
DESTINATION="hosting@hosting"

podman build --pull --rm -f 'Dockerfile' -t 'pc2-laptimes:latest' '.'
podman save pc2-laptimes:latest -o pc2-laptimes.tar

scp -r pc2-laptimes.tar $DESTINATION:/opt/containers/pc2-laptimes.tar

ssh $DESTINATION 'podman load -i /opt/containers/pc2-laptimes.tar'

ssh $DESTINATION 'systemctl --user restart container-pc2-laptimes'
