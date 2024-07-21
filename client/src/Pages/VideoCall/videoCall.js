import React, { useEffect, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Peer from "simple-peer";
import io from "socket.io-client";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PhoneIcon from "@mui/icons-material/Phone";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import VideocamIcon from "@mui/icons-material/Videocam"; // Use the correct icon
import StopIcon from "@mui/icons-material/Stop";
import "./videoCall.css";

const socket = io.connect("http://localhost:5000");

function Videocall() {
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const [screenSharing, setScreenSharing] = useState(false);
  const [isCallAllowed, setIsCallAllowed] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const combinedStream = useRef(new MediaStream());
  const recordedStream = useRef(new MediaStream());

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      setStream(stream);
      if (myVideo.current) {
        myVideo.current.srcObject = stream;
      }
      // Add local video and audio to the combined stream
      stream.getTracks().forEach((track) => combinedStream.current.addTrack(track));
    });

    socket.on("me", (id) => {
      setMe(id);
    });

    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });

    const checkCallAvailability = () => {
      const now = new Date();
      const hours = now.getHours();
      setIsCallAllowed(hours >= 18 || hours < 18);
    };

    checkCallAvailability();
    const interval = setInterval(checkCallAvailability, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });
    peer.on("stream", (userStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = userStream;
      }
      // Add remote video and audio to the combined stream
      userStream.getTracks().forEach((track) => combinedStream.current.addTrack(track));
      // Create a new MediaStream for recording
      recordedStream.current.addTrack(userStream.getVideoTracks()[0]);
      recordedStream.current.addTrack(userStream.getAudioTracks()[0]);
    });
    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });
    peer.on("stream", (userStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = userStream;
      }
      // Add remote video and audio to the combined stream
      userStream.getTracks().forEach((track) => combinedStream.current.addTrack(track));
      // Create a new MediaStream for recording
      recordedStream.current.addTrack(userStream.getVideoTracks()[0]);
      recordedStream.current.addTrack(userStream.getAudioTracks()[0]);
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
};

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };

  const handleCopy = () => {
    console.log("ID copied to clipboard: ", me);
  };

  const startScreenShare = () => {
    navigator.mediaDevices.getDisplayMedia({ cursor: true }).then((screenStream) => {
      setScreenSharing(true);
      const screenTrack = screenStream.getTracks()[0];
      connectionRef.current.replaceTrack(
        stream.getVideoTracks()[0],
        screenTrack,
        stream
      );
      screenTrack.onended = () => {
        stopScreenShare();
      };
      // Add screen share video to the combined stream
      combinedStream.current.addTrack(screenTrack);
      recordedStream.current.addTrack(screenTrack);
    });
  };

  const stopScreenShare = () => {
    setScreenSharing(false);
    const videoTrack = stream.getVideoTracks()[0];
    connectionRef.current.replaceTrack(
      connectionRef.current.streams[0].getVideoTracks()[0],
      videoTrack,
      stream
    );
    // Remove screen share video from the combined stream
    combinedStream.current.getVideoTracks().forEach((track) => {
      if (track.kind === "video" && track.label.includes("screen")) {
        combinedStream.current.removeTrack(track);
        track.stop();
      }
    });
    recordedStream.current.getVideoTracks().forEach((track) => {
      if (track.kind === "video" && track.label.includes("screen")) {
        recordedStream.current.removeTrack(track);
        track.stop();
      }
    });
  };

  const startRecording = () => {
    if (recordedStream.current) {
      const recorder = new MediaRecorder(recordedStream.current);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };
      setMediaRecorder(recorder);
      recorder.start();
      setRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  useEffect(() => {
    if (!recording && recordedChunks.length > 0) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "recording.webm";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      setRecordedChunks([]);
    }
  }, [recording, recordedChunks]);

  return (
    <>
      <h1 style={{ textAlign: "center", color: "#fff" }}>Video Call</h1>
      <div className="container">
        <div className="video-container">
          <div className="video">{stream && <video playsInline muted ref={myVideo} autoPlay style={{ width: "400px" }} />}</div>
          <div className="video">{callAccepted && !callEnded ? <video playsInline ref={userVideo} autoPlay style={{ width: "400px" }} /> : null}</div>
        </div>
        <div className="myId">
          <TextField id="filled-basic" label="Name" variant="filled" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: "20px" }} />
          <CopyToClipboard text={me} onCopy={handleCopy}>
            <Button variant="contained" color="primary" startIcon={<AssignmentIcon fontSize="large" />}>
              Copy ID
            </Button>
          </CopyToClipboard>

          <TextField id="filled-basic" label="ID to call" variant="filled" value={idToCall} onChange={(e) => setIdToCall(e.target.value)} />
          <div className="call-button">
            {callAccepted && !callEnded ? (
              <Button variant="contained" color="secondary" onClick={leaveCall}>
                End Call
              </Button>
            ) : (
              <IconButton color="primary" aria-label="call" onClick={() => callUser(idToCall)} disabled={!isCallAllowed}>
                <PhoneIcon fontSize="large" />
              </IconButton>
            )}
          </div>
        </div>
        {callAccepted && !callEnded && (
          <>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ScreenShareIcon />}
              onClick={screenSharing ? stopScreenShare : startScreenShare}
              style={{ marginTop: "20px", width: "150px" }}
            >
              {screenSharing ? "Stop Sharing" : "Share Screen"}
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<VideocamIcon />}
              onClick={recording ? stopRecording : startRecording}
              style={{ marginTop: "20px", width: "150px" }}
            >
              {recording ? "Stop Recording" : "Start Recording"}
            </Button>
          </>
        )}
        <div>
          {receivingCall && !callAccepted ? (
            <div className="caller">
              <h1>{name} is calling...</h1>
              <Button variant="contained" color="primary" onClick={answerCall}>
                Answer
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

export default Videocall;