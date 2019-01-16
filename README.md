# easyrtc ionic

Server (nodejs): 
Download the latest source from: https://github.com/priologic/easyrtc
Run the server with SSL: node server_ssl.js

Client (ionic)
Change this statement in connect() funtion/home.ts to your server address: easyrtc.setSocketUrl("https://***.***.***.***:8443");
For further information, visit the orginal starter template for Ionic projects at https://github.com/nakulkundaliya/ionic-3-video-calling-using-webrtc.