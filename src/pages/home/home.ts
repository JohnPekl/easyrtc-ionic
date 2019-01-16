import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NativeAudio } from '@ionic-native/native-audio';
import { AndroidPermissions } from '@ionic-native/android-permissions';

declare var easyrtc: any;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  showCall: boolean;
  showHangup: boolean;
  showAnswer: boolean;
  showReject: boolean;
  showStatus: boolean;
  showRemoteVideo: boolean = true;
  showMyVideo: boolean = true;

  localStream;
  currentCamera: boolean = true; // front or rear

  session;
  webRTCClient;
  incomingCallId = 0;
  myCallId;
  status;
  calleeId;

  constructor(public navCtrl: NavController, private nativeAudio: NativeAudio, private androidPermissions: AndroidPermissions) {
    //this.InitializeApiRTC();

    this.nativeAudio.preloadComplex('uniqueI1', 'assets/tone.mp3', 1, 1, 0).then((succ) => {
      console.log("suu", succ)
    }, (err) => {
      console.log("err", err)
    });
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.CAMERA).then(
      result => console.log('Has permission?', result.hasPermission),
      err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.CAMERA)
    );
    this.androidPermissions.requestPermissions(
      [this.androidPermissions.PERMISSION.CAMERA,
      this.androidPermissions.PERMISSION.GET_ACCOUNTS,
      androidPermissions.PERMISSION.CALL_PHONE,
      androidPermissions.PERMISSION.RECORD_AUDIO,
      androidPermissions.PERMISSION.READ_CONTACTS,
      androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
      androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE]);

  }

  ionViewDidLoad() {
    // Put here the code you want to execute after the page has fully loaded
    this.connect();
  }

  connect() {
    easyrtc.setSocketUrl("https://***.***.***.***:8443");
    easyrtc.setVideoDims(256, 144);
    easyrtc.enableDebug(false);
    easyrtc.enableDataChannels(true);
    //easyrtc.setRoomOccupantListener(convertListToButtons);
    this.InitializeControls();
    this.AddEventListenersEasyRTC();
    easyrtc.enableAudio(true);
    easyrtc.enableVideo(true);

    easyrtc.connect("easyrtc.audioVideo", (easyrtcid) => {
      this.myCallId = easyrtcid;

      try {
        //alert(easyrtc.idToName(easyrtcid));
      }
      catch (err) {
        alert("try, catch (): " + err)
      }
      easyrtc.initMediaSource(
        (mediastream) => {
          this.localStream = mediastream;
        },
        (errorCode, errorText) => {
          easyrtc.showError(errorCode, errorText);
        });
    }, this.loginFailure);
  }

  performCall(otherEasyrtcid) {
    easyrtc.hangupAll();

    var successCB = () => {
      if (this.localStream) {
        var selfVideo = document.getElementById("selfVideo");
        easyrtc.setVideoObjectSrc(selfVideo, this.localStream);
      }
      //enable("hangupButton");
    };
    var failureCB = function () { };
    var acceptedCB = (accepted, easyrtcid) => {
      if (!accepted) {
        //easyrtc.showError("CALL-REJECTEd", "Sorry, your call to " + easyrtc.idToName(easyrtcid) + " was rejected");
        alert("CALL-REJECTEd: Sorry, your call to " + easyrtc.idToName(easyrtcid) + " was rejected");
        this.InitializeControls();
        //enable("otherClients");
      } else if (this.localStream) {
        var selfVideo = document.getElementById("selfVideo");
        easyrtc.setVideoObjectSrc(selfVideo, this.localStream);
      }
    };
    this.InitializeControlsForPerformCall();
    easyrtc.call(otherEasyrtcid, successCB, failureCB, acceptedCB);
  }

  loginSuccess(easyrtcid) {
    this.myCallId = easyrtc.cleanId(easyrtcid);
    //document.getElementById("iam").innerHTML = "I am " + easyrtc.cleanId(easyrtcid);
  }

  loginFailure(errorCode, message) {
    //easyrtc.showError(errorCode, message);
    alert("loginFailure: " + message)
  }

  InitializeControls() {
    this.showCall = true;
    this.showAnswer = false;
    this.showHangup = false;
    this.showReject = false;
  }

  InitializeControlsForIncomingCall() {
    this.showCall = false;
    this.showAnswer = true;
    this.showReject = true;
    this.showHangup = false;
    this.nativeAudio.loop('uniqueI1').then((succ) => {
      console.log("succ", succ)
    }, (err) => {
      console.log("err", err)
    });
  }

  InitializeControlsForHangup() {
    this.showCall = true;
    this.showAnswer = false;
    this.showReject = false;
    this.showHangup = false;
  }

  InitializeControlsForPerformCall() {
    this.showCall = false;
    this.showAnswer = false;
    this.showReject = false;
    this.showHangup = true;
  }

  UpdateControlsOnAnswer() {
    this.showAnswer = false;
    this.showReject = false;
    this.showHangup = true;
    this.showCall = false;
  }

  UpdateControlsOnReject() {
    this.showAnswer = false;
    this.showReject = false;
    this.showHangup = false;
    this.showCall = true;
  }

  AddEventListenersEasyRTC() {
    easyrtc.setAcceptChecker((easyrtcid, callback) => {
      this.InitializeControlsForIncomingCall();
      this.incomingCallId = easyrtc.idToName(easyrtcid);
      //alert("A call from: " + this.incomingCallId);

      //document.getElementById("acceptCallBox").style.display = "block";
      if (easyrtc.getConnectionCount() > 0) {
        //alert("Drop current call and accept new from " + easyrtc.idToName(easyrtcid) + " ?");
      }
      else {
        //alert("Accept incoming call from " + easyrtc.idToName(easyrtcid) + " ?");
      }
      var acceptTheCall = function (wasAccepted) {
        //document.getElementById("acceptCallBox").style.display = "none";
        if (wasAccepted && easyrtc.getConnectionCount() > 0) {
          easyrtc.hangupAll();
        }
        callback(wasAccepted);
      };

      document.getElementById("btnShowAnswer").onclick = () => {
        acceptTheCall(true);
        this.nativeAudio.stop('uniqueI1').then(() => { }, () => { });
        this.UpdateControlsOnAnswer();
      };
      document.getElementById("btnShowReject").onclick = () => {
        acceptTheCall(false);
        this.UpdateControlsOnReject();
        this.nativeAudio.stop('uniqueI1').then(() => { }, () => { });
      };
    });

    easyrtc.setCallCancelled((easyrtcid, explicitlyCancelled) => {
      if (explicitlyCancelled) {
        alert(easyrtc.idToName(easyrtcid) + " stopped trying to reach you");
        this.InitializeControls();
        this.nativeAudio.stop('uniqueI1').then(() => { }, () => { });
      }
      else {
        alert("Implicitly called " + easyrtc.idToName(easyrtcid));
      }
    });

    easyrtc.setStreamAcceptor((easyrtcid, stream) => {
      var video = document.getElementById("callerVideo");
      easyrtc.setVideoObjectSrc(video, stream);
      console.log("saw video from " + easyrtcid);

      var selfVideo = document.getElementById("selfVideo");
      easyrtc.setVideoObjectSrc(selfVideo, this.localStream);

      this.nativeAudio.stop('uniqueI1').then(() => { }, () => { });
      this.UpdateControlsOnAnswer();
    });

    easyrtc.setOnStreamClosed((easyrtcid) => {
      easyrtc.setVideoObjectSrc(document.getElementById("callerVideo"), "");
      easyrtc.setVideoObjectSrc(document.getElementById("selfVideo"), "");
      this.InitializeControlsForHangup();
    });
  }

  HangUp() {
    //easyrtc.hangup(this.incomingCallId);
    easyrtc.hangupAll();
    this.InitializeControlsForHangup();
  }

  SwitchCamera() {
    easyrtc.getVideoSourceList((list) => {
      var i;
      //alert(JSON.stringify(this.localStream) + ', ' + JSON.stringify(list[i]))
      if (this.currentCamera) {
        easyrtc.setVideoSource(list[0].deviceid);
        this.currentCamera = false;
      }
      else {
        easyrtc.setVideoSource(list[1].deviceid);
        this.currentCamera = true;
      }
    });
  }
}
