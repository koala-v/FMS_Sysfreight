
jarsigner -digestalg SHA1 -sigalg MD5withRSA -verbose -keystore ./my-release-key.keystore -signedjar FreightApp.apk com.sysmagic.freight.apk alias_name

pause