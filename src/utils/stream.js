import axios from "axios";

export class PullStream {
  url = "";
  pc = null;
  video = null;

  connect() {
    const pc = new RTCPeerConnection();
    this.pc = pc;
    pc.addTransceiver("video", {
      direction: "recvonly",
    });
    pc.addTransceiver("audio", {
      direction: "recvonly",
    });

    const stream = new MediaStream();
    pc.ontrack = (e) => {
      stream.addTrack(e.track);
      this.video.autoplay = true;
      this.video.playsinline = true;
      this.video.playsInline = true;
      this.video.srcObject = stream;
    };

    function remoteConnection(url, offer) {
      return fetch(url, {
        method: "POST",
        headers: {
          accept: "application/text",
          "content-type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({ type: "offer", sdp: offer.sdp }),
      })
        .then((res) => res.body)
        .then((rb) => {
          const reader = rb.getReader();
          return new ReadableStream({
            start(controller) {
              function push() {
                reader.read().then(({ done, value }) => {
                  if (done) {
                    controller.close();
                    return;
                  }
                  controller.enqueue(value);
                  push();
                });
              }
              push();
            },
          });
        })
        .then((str) =>
          new Response(str, { headers: { "Content-Type": "text/html" } }).text()
        )
        .then((result) => (result ? JSON.parse(result) : result))
        .catch((error) => {
          console.log("log========fetch==>>", error);
        });
    }
    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .then(() =>
        pc.localDescription
          ? remoteConnection(this.url, pc.localDescription)
          : null
      )
      .then((answer) => {
        if (pc.signalingState !== "closed" && answer)
          pc.setRemoteDescription({ type: "answer", sdp: answer.sdp });
      });
  }

  disconnect() {
    if (this.video) {
      this.video.pause();
      this.video.removeAttribute("src");
      this.video.srcObject = null;
      this.video.load();
    }
    if (this.pc) {
      this.pc.ontrack = null;
      this.pc.onconnectionstatechange = null;
      this.pc.close();
      this.pc = null;
    }
  }

  reconnect() {
    this.disconnect();
    this.connect();
  }

  pull(url, video) {
    this.url = url;
    this.video = video;
    this.reconnect();
  }
}

export class PushStream {
  url = "";

  pc = null;

  // hasGetUserMedia() {
  //   return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  // }

  async connect(cb) {
    try {
      // if (this.hasGetUserMedia()) {
      //   // Good to go!
      //   console.log("Gooddd................");
      // } else {
      //   alert("getUserMedia() is not supported by your browser===========");
      // }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
      const pc = new RTCPeerConnection();

      this.pc = pc;
      const [videoTrack] = stream.getVideoTracks();
      const [audioTrack] = stream.getAudioTracks();
      pc.addTransceiver("video", {
        direction: "sendonly",
      });
      pc.addTransceiver("audio", {
        direction: "sendonly",
      });

      if (videoTrack) {
        pc.addTransceiver(videoTrack, {
          direction: "sendonly",
          streams: [stream],
        });
      }
      if (audioTrack) {
        pc.addTransceiver(audioTrack, {
          direction: "sendonly",
          streams: [stream],
        });
      }

      async function remoteConnection(url, offer) {
        return await axios.post(url, { type: "offer", sdp: offer.sdp });
      }

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (pc.localDescription) {
        const answer = await remoteConnection(this.url, pc.localDescription);

        if (pc.signalingState !== "closed") {
          pc.setRemoteDescription({ type: "answer", sdp: answer.sdp });

          cb();
        }
      }
    } catch (error) {
      console.log("log=====ff1=========>>>0", error);
    }
  }

  disconnect() {
    if (this.pc) {
      this.pc.getSenders().forEach((sender) => {
        sender?.track?.stop();
      });
      this.pc.ontrack = null;
      this.pc.onconnectionstatechange = null;
      this.pc.close();
      this.pc = null;
    }
  }

  reconnect(cb) {
    this.disconnect();
    return this.connect(cb);
  }

  push(url, cb) {
    this.url = url;
    return this.reconnect(cb);
  }
}
