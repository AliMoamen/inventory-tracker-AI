import { useContext } from "react";
import "../styles/Overlay.scss";
import { UserContext } from "../Context/UserContext";
const Overlay = () => {
  const { setShowForm, setCamera }: any = useContext(UserContext);
  return (
    <div
      onClick={() => {
        setShowForm(false);
        setCamera(false);
      }}
      className="overlay flex-center fade-in"
    ></div>
  );
};
export default Overlay;
