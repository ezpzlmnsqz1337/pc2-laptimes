#!/bin/bash
#
# Install this project's Podman Quadlet units on the hosting VM and reload systemd.
#
# The pod/container definitions for this project live in ./quadlet/ next to this
# script, in the same repo as the app — so a port, env var or volume change lands
# in one commit with the code that needs it.
#
# Units are installed into ~/.config/containers/systemd/ on the VM. Boot
# enablement is a symlink into default.target.wants/ (systemctl enable refuses
# generator units). Does NOT start anything — see deploy.sh.
#
set -euo pipefail

DESTINATION="${DESTINATION:-hosting@hosting}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
QDIR="$HERE/quadlet"

[ -d "$QDIR" ] || { echo "ERROR: no quadlet dir at $QDIR" >&2; exit 1; }

echo ">> copying units to $DESTINATION"
ssh "$DESTINATION" 'mkdir -p ~/.config/containers/systemd/env'
scp -q "$QDIR"/*.container "$DESTINATION":~/.config/containers/systemd/
if compgen -G "$QDIR/*.pod" > /dev/null; then
  scp -q "$QDIR"/*.pod "$DESTINATION":~/.config/containers/systemd/
fi
if compgen -G "$QDIR/env/*.env" > /dev/null; then
  scp -q "$QDIR"/env/*.env "$DESTINATION":~/.config/containers/systemd/env/
fi

echo ">> linking units for boot and reloading systemd"
ssh "$DESTINATION" 'set -e
  cd "$HOME/.config/containers/systemd"
  W="$HOME/.config/systemd/user/default.target.wants"
  mkdir -p "$W"
  for f in *.pod; do
    [ -e "$f" ] || continue
    ln -sf "$PWD/$f" "$W/${f%.pod}-pod.service"
  done
  for f in *.container; do
    [ -e "$f" ] || continue
    ln -sf "$PWD/$f" "$W/${f%.container}.service"
  done
  systemctl --user daemon-reload
  echo "   units now present:"
  ls -1 "$PWD"/*.container "$PWD"/*.pod 2>/dev/null | xargs -n1 basename | sed "s/^/     /"
'
echo ">> done"
