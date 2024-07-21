import React, { useState, useEffect } from "react";
import "./Navbar.css";
import logo from "./logo.ico";
import SearchBar from "./SearchBar/SearchBar";
import { RiVideoAddLine } from "react-icons/ri";
import { BiUserCircle } from "react-icons/bi";
import { GoogleLogin } from "react-google-login";
import { gapi } from "gapi-script";
import { Link } from "react-router-dom";
import { IoMdNotificationsOutline } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../actions/auth";
import Auth from "../../Pages/Auth/Auth";
import { getPoints } from "../../actions/Points";
import videocall from './videocall.jpg';

function Navbar({ toggleDrawer, setEditCreateChanelBtn }) {
  const [AuthBtn, setAuthBtn] = useState(false);
  const [isCallAllowed, setIsCallAllowed] = useState(false);
  const CurrentUser = useSelector(state => state.currentUserReducer);

  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId: "341537644426-f3v9od7ndhf0a9a2nsj0pe65rl9kk168.apps.googleusercontent.com",
        scope: "email",
      });
    }
    gapi.load("client:auth2", start);
  }, []);

  const dispatch = useDispatch();
  useEffect(() => {
    if (CurrentUser?.result?._id) {
      dispatch(getPoints(CurrentUser.result._id)); // Fetch points when CurrentUser is available
    }
  }, [dispatch, CurrentUser]);

  const onSuccess = (response) => {
    const Email = response?.profileObj.email;
    console.log(Email);
    dispatch(login({ email: Email }));
  };

  const onFailure = (response) => {
    console.log("Failed", response);
  };

  useEffect(() => {
    const checkCallAvailability = () => {
      const now = new Date();
      const hours = now.getHours();
      setIsCallAllowed(hours >= 18 || hours <18);
    };

    checkCallAvailability();
    const interval = setInterval(checkCallAvailability, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="Container_Navbar">
        <div className="Burger_Logo_Navbar">
          <div className="burger" onClick={() => toggleDrawer()}>
            <p></p>
            <p></p>
            <p></p>
          </div>

          <Link to={"/"} className="logo_div_Navbar">
            <img src={logo} alt="" />
            <p className="logo_title_navbar">YouTube</p>
          </Link>
        </div>

        <SearchBar />

        {isCallAllowed ? (
          <Link className="video-call" to="/video-call">
            <img src={videocall} alt="Video Call" style={{ cursor: 'pointer' }} />
          </Link>
        ) : (
          <div style={{color:"white" , marginTop:"15px", marginRight:"10px"}}>VC available from 6 PM to 12 AM</div>
        )}

        <RiVideoAddLine size={22} className={"vid_bell_Navbar"} />

        <div className="apps_Box">
          <p className="appBox"></p>
          <p className="appBox"></p>
          <p className="appBox"></p>
          <p className="appBox"></p>
          <p className="appBox"></p>
          <p className="appBox"></p>
          <p className="appBox"></p>
          <p className="appBox"></p>
          <p className="appBox"></p>
        </div>
        <IoMdNotificationsOutline size={22} className="vid_bell_Navbar" />
        <div className="Auth_cont_Navbar">
          {CurrentUser ? (
            <>
              <div className="Chanel_logo_App" onClick={() => setAuthBtn(true)}>
                <p className="fstChar_logo_App">
                  {CurrentUser?.result.name ? (
                    <>{CurrentUser?.result.name.charAt(0).toUpperCase()}</>
                  ) : (
                    <>{CurrentUser?.result.email.charAt(0).toUpperCase()}</>
                  )}
                </p>
              </div>
            </>
          ) : (
            <>
              <GoogleLogin
                clientId={"341537644426-f3v9od7ndhf0a9a2nsj0pe65rl9kk168.apps.googleusercontent.com"}
                onSuccess={onSuccess}
                onFailure={onFailure}
                render={(renderProps) => (
                  <p onClick={renderProps.onClick} className="Auth_Btn">
                    <BiUserCircle size={22} />
                    <b>Sign in</b>
                  </p>
                )}
              />
            </>
          )}
        </div>
      </div>
      {AuthBtn && (
        <Auth
          setEditCreateChanelBtn={setEditCreateChanelBtn}
          setAuthBtn={setAuthBtn}
          User={CurrentUser}
        />
      )}
    </>
  );
}

export default Navbar;