import React, { useEffect } from "react";
import { GoogleLogout } from "react-google-login";
import { BiLogOut } from "react-icons/bi";
import { Link } from "react-router-dom";
import { setCurrentUser } from "../../actions/currentUser";
import "./Auth.css";
import { getPoints } from "../../actions/Points";
import { useDispatch, useSelector } from "react-redux";

function Auth({ User, setAuthBtn, setEditCreateChanelBtn }) {
  const points = useSelector((state) => state.pointsReducer.points);
  const CurrentUser = useSelector((state) => state.currentUserReducer);

  const dispatch = useDispatch();

  const onLogOutSuccess = () => {
    dispatch(setCurrentUser(null));
    alert("Log Out Successfully");
  };

  useEffect(() => {
    if (CurrentUser?.result?._id) {
      dispatch(getPoints(CurrentUser.result._id)); 
    }
  }, [dispatch, CurrentUser]); 

  return (
    <div className="Auth_container" onClick={() => setAuthBtn(false)}>
      <div className="Auth_container2" onClick={(e) => e.stopPropagation()}>
        <div className="User_Details">
          <div className="Chanel_logo_App">
            <p className="fstChar_logo_App">
              {User?.result.name ? (
                <>{User?.result.name.charAt(0).toUpperCase()} </>
              ) : (
                <>{User?.result.email.charAt(0).toUpperCase()} </>
              )}
            </p>
          </div>
          <div className="email_Auth">{User?.result.email}</div>
        </div>
        <div className="btns_Auth">
          {User?.result.name ? (
            <>
              <Link to={`/chanel/${User?.result._id}`} className="btn_Auth">
                Your Chanel
              </Link>
              <span><b>Points: {typeof points === 'number' ? points : 'Loading...'}</b></span>
            </>
          ) : (
            <>
              <input
                type="submit"
                className="btn_Auth"
                value="Create Your Chanel"
                onClick={() => setEditCreateChanelBtn(true)}
              />
              <div className="myy">Create Channel To View Points</div>
            </>
          
          )}
          <div>
            <GoogleLogout
              clientId="341537644426-f3v9od7ndhf0a9a2nsj0pe65rl9kk168.apps.googleusercontent.com"
              onLogoutSuccess={onLogOutSuccess}
              render={(renderProps) => (
                <div onClick={renderProps.onClick} className="btn_Auth">
                  <BiLogOut />
                  Log Out
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;