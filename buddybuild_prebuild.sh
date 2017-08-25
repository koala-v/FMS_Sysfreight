#!/usr/bin/env bash

cd /Users/buddybuild/workspace/FreightMob

if [ -z ${PLATFORM+x} ]; then 
	echo '=== Detected Environmental Variable PLATFORM is set : $PLATFORM'
	ionic prepare $PLATFORM
else 
	echo '=== Can Not Detected Environmental Variable PLATFORM. ionic prepare both ios and android. PLATFORM: $PLATFORM'
	ionic prepare ios
	ionic prepare android
fi
