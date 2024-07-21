import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import Comments from "../../Components/Comments/Comments";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import LikeWatchLaterSaveBtns from "./LikeWatchLaterSaveBtns";
import "./VideoPage.css";
import { addToHistory } from "../../actions/History";
import { viewVideo } from "../../actions/video";
import { updatePoints } from "../../actions/Points";
import { useNavigate } from "react-router-dom";
function VideoPage() {
  const { vid } = useParams();
  const vids = useSelector((state) => state.videoReducer);
  const vv = vids?.data.filter((q) => q._id === vid)[0];
  const dispatch = useDispatch();
  const CurrentUser = useSelector((state) => state?.currentUserReducer);
  const [pointsUpdated, setPointsUpdated] = useState(false);
  const videoRef = useRef(null);
  const commentSectionRef = useRef(null);
  const currentVideoIndex = vids.data.findIndex((q) => q._id === vid);
  const nextVideoIndex = currentVideoIndex + 2;
  const nextVideo = vids.data[nextVideoIndex];
  const navigate = useNavigate();

  const handleHistory = () => {
    dispatch(
      addToHistory({
        videoId: vid,
        Viewer: CurrentUser?.result._id,
      })
    );
  };
  const handleViews = () => {
    dispatch(
      viewVideo({
        id: vid,
      })
    );
  };
  useEffect(() => {
    if (CurrentUser) {
      handleHistory();
      handleViews();
      if (!pointsUpdated) {
        dispatch(updatePoints(CurrentUser?.result._id, { points: 5 }));
        setPointsUpdated(true);
      }
    }
  }, [CurrentUser, vid, dispatch, pointsUpdated]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") {
        videoRef.current.playbackRate = 2;
      } else if (event.key === "ArrowLeft") {
        videoRef.current.playbackRate = 0.5;

      
      }
      if (event.key === "k") {
        videoRef.current.currentTime += 10;
      } else if (event.key === "a") {
        videoRef.current.currentTime -= 10;
      } else if (event.key === "c") {
        window.location.href = "https://www.google.com"; // Redirect to Google
      } else if (event.key === "o") {
        // Move focus to the comment section
        commentSectionRef.current.focus();
      } else if (event.key === "l") {
        // Get current location and temperature
        navigator.geolocation.getCurrentPosition((position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const appid = "b6d38f62792ecb88f2a826edd4764185";
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appid}`)
          
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(response.statusText);
    }
  })
  .then(data => {
    const location = data.name;
    let temp = '';
    if (data.main) {
      temp = (data.main.temp - 273.15).toFixed(2);
    } else {
      temp = 'Unknown';
    }
    alert(`You are currently in ${location} and the temperature is ${temp}°C`);
    // alert(`You are currently in location and the temperature is tempc`);
  })
  .catch(error => {
    if (error.message === "Invalid API key. Please see https://openweathermap.org/faq#error401 for more info.") {
      alert("Error: Invalid API key. Please check your API key and try again.");
    } else {
      alert("Error: " + error.message);
    }
  });
        });
      }
      else if (event.shiftKey && event.key === "N") {
        if (nextVideo) {
          navigate(`/video/${nextVideo._id}`);
        } else {
          // If there is no next video, you can navigate to the first video or do something else
          navigate(`/video/${vids.data[0]._id}`);
        }
      }
      
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [videoRef, commentSectionRef, vids, navigate]);

  return (
    <>
      <div className="container_videoPage">
        <div className="container2_videoPage">
          <div className="video_display_screen_videoPage">
            <video
              ref={videoRef}
              src={`http://localhost:5500/${vv?.filePath}`}
              className={"video_ShowVideo_videoPage"}
              controls
            />
            <div className="video_details_videoPage">
              <div className="video_btns_title_VideoPage_cont">
                <p className="video_title_VideoPage"> {vv?.videoTitle}</p>
                <div className="views_date_btns_VideoPage">
                  <div className="views_videoPage">
                    {vv?.Views} views <div className="dot"></div>{" "}
                    {moment(vv?.createdAt).fromNow()}
                  </div>
                  <LikeWatchLaterSaveBtns vv={vv} vid={vid} />
                </div>
              </div>
              <Link
                to={`/chanel/${vv?.videoChanel}`}
                className="chanel_details_videoPage"
              >
                <b className="chanel_logo_videoPage">
                  <p>{vv?.Uploder.charAt(0).toUpperCase()}</p>
                </b>
                <p className="chanel_name_videoPage">{vv?.Uploder}</p>
              </Link>
              <div className="comments_VideoPage" tabIndex={0} ref={commentSectionRef}>
                <h2>
                  <u>Coments</u>
                </h2>
                <Comments videoId={vv._id} />
              </div>
            </div>
          </div>
          <div className="moreVideoBar">More video</div>
        </div>
      </div>
    </>
  );
}

export default VideoPage;