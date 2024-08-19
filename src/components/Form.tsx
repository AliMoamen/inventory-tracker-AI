import { TextField } from "@mui/material";
import "../styles/SignInForm.scss";
import Overlay from "./Overlay";
import { useContext, useState } from "react";
import { auth, db } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { setDoc, doc, collection } from "firebase/firestore";
import { UserContext } from "../Context/UserContext";

export type UserInfo = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  items: [];
};

export const Form = () => {
  const { setUser, setShowForm }: any = useContext(UserContext);
  const [signInError, setSignInError] = useState(false);
  const [emailInUse, setEmailInUse] = useState(false);
  const [signIn, setSignIn] = useState(true);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    items: [],
  });
  const [fieldErrors, setFieldErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
  });

  const linkStyle = {
    color: "blue",
    textDecoration: "underline",
    cursor: "pointer",
  };

  const validateEmail = (email: string): boolean => {
    // Regular expression to validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateFields = () => {
    const errors = {
      firstName: !userInfo.firstName && !signIn,
      lastName: !userInfo.lastName && !signIn,
      email: !userInfo.email || !validateEmail(userInfo.email),
      password:
        (!userInfo.password && !forgotPassword) ||
        (userInfo.password.length < 6 && !forgotPassword),
    };
    setFieldErrors(errors);
    return !Object.values(errors).some((error) => error);
  };

  const handleSignup = async () => {
    if (!validateFields()) return;

    try {
      if (signIn) {
        await signInWithEmailAndPassword(
          auth,
          userInfo.email,
          userInfo.password
        );
        setUser(auth.currentUser);
        setShowForm(false);
      } else {
        await createUserWithEmailAndPassword(
          auth,
          userInfo.email,
          userInfo.password
        );
        await setDoc(doc(collection(db, "userInfo"), auth.currentUser?.uid), {
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          email: userInfo.email,
          items: userInfo.items,
        });
        setSignIn(true);
        setShowForm(false);
        resetUserInfo();
      }
    } catch (err: any) {
      if (signIn) {
        setSignInError(true);
      } else if (err.code === "auth/email-already-in-use") {
        setEmailInUse(true);
      } else {
        console.error("Error during signup:", err);
      }
    }
  };

  const handleResetPassword = async () => {
    if (!validateFields()) return;

    try {
      await sendPasswordResetEmail(auth, userInfo.email);
      setSignIn(true);
      setForgotPassword(false);
    } catch (err) {
      console.error("Error resetting password:", err);
    }
  };

  const resetUserInfo = () => {
    setUserInfo({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      items: [],
    });
    setSignInError(false);
    setEmailInUse(false);
    setFieldErrors({
      firstName: false,
      lastName: false,
      email: false,
      password: false,
    });
  };

  const renderNameFields = () => (
    <div className="flex-row">
      <TextField
        required
        style={{ width: "100%" }}
        label="First Name"
        variant="outlined"
        value={userInfo.firstName}
        onChange={(e) =>
          setUserInfo({ ...userInfo, firstName: e.target.value })
        }
        error={fieldErrors.firstName}
      />
      <TextField
        required
        style={{ width: "100%" }}
        label="Last Name"
        variant="outlined"
        value={userInfo.lastName}
        onChange={(e) => setUserInfo({ ...userInfo, lastName: e.target.value })}
        error={fieldErrors.lastName}
      />
    </div>
  );

  const renderEmailField = () => (
    <TextField
      error={signInError || emailInUse || fieldErrors.email}
      required
      style={{ width: "100%" }}
      label="Email"
      variant="outlined"
      type="email"
      value={userInfo.email}
      onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
      helperText={
        emailInUse
          ? "Email is already in use"
          : fieldErrors.email
          ? "Invalid email format"
          : ""
      }
    />
  );

  const renderPasswordField = () => (
    <TextField
      error={signInError || fieldErrors.password}
      helperText={
        signInError
          ? "Invalid Email or Password"
          : fieldErrors.password
          ? "Password must be at least 6 characters"
          : ""
      }
      required
      style={{ width: "100%" }}
      label="Password"
      variant="outlined"
      type="password"
      value={userInfo.password}
      onChange={(e) => setUserInfo({ ...userInfo, password: e.target.value })}
    />
  );

  return (
    <>
      <Overlay />
      <div className="transparent-container flex-center">
        <form
          noValidate
          className="flex-col flex-center form fade-in"
          onSubmit={(e) => {
            e.preventDefault();
            forgotPassword ? handleResetPassword() : handleSignup();
          }}
        >
          {!signIn && !forgotPassword && renderNameFields()}

          {renderEmailField()}

          {!forgotPassword && renderPasswordField()}

          {signIn && !forgotPassword && (
            <div style={{ width: "100%" }}>
              <p>
                <a
                  style={linkStyle}
                  onClick={() => {
                    setForgotPassword(true);
                    setSignIn(false);
                  }}
                >
                  Forgot your Password?
                </a>
              </p>
            </div>
          )}

          <button>
            {signIn
              ? "Sign In"
              : forgotPassword
              ? "Send Reset Link"
              : "Sign Up"}
          </button>

          {signIn ? (
            <p>
              New User?{" "}
              <a
                style={linkStyle}
                onClick={() => {
                  setSignIn(false);
                  resetUserInfo();
                }}
              >
                Sign Up
              </a>
            </p>
          ) : (
            <p>
              Existing User?{" "}
              <a
                style={linkStyle}
                onClick={() => {
                  setSignIn(true);
                  resetUserInfo();
                  setForgotPassword(false);
                }}
              >
                Sign In
              </a>
            </p>
          )}
        </form>
      </div>
    </>
  );
};
