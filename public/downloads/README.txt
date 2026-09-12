keyd-app.apk — Android release build of Keyd App.

Default download URL: /downloads/keyd-app.apk
Override with NEXT_PUBLIC_KEYD_APP_APK_URL if hosted elsewhere.

Rebuild from:
  cd /home/zack/Documents/keyd-app/apps/mobile
  flutter build apk --release
  cp build/app/outputs/flutter-apk/app-release.apk \
     /home/zack/Documents/keydtech/public/downloads/keyd-app.apk
