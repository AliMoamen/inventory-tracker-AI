import { useContext, useRef, useState } from "react";
import "../styles/Camera.scss";
import { Camera } from "react-camera-pro";
import { FaCamera } from "react-icons/fa";
import { recognize } from "../scripts/recognize";
import { PantryItemInfo } from "./PantryItemForm";
import Overlay from "./Overlay";
import { UserContext } from "../Context/UserContext";
import { IconButton } from "@mui/material";

const CameraComponent = ({
  setRecognize,
}: {
  setRecognize: React.Dispatch<React.SetStateAction<PantryItemInfo | null>>;
}) => {
  const { setShowForm, setCamera }: any = useContext(UserContext);
  const [recognizeError, setRecognizeError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const camera = useRef(null);
  const errorMessages = {
    noCameraAccessible:
      "No camera device accessible. Please connect your camera or try a different browser.",
    permissionDenied:
      "Permission denied. Please refresh and give camera permission.",
    switchCamera:
      "It is not possible to switch camera to different one because there is only one video device accessible.",
    canvas: "Canvas is not supported.",
  };

  const handleRecognize = async (image: string) => {
    if (!image) return;
    setRecognizeError(false);
    setLoading(true);
    const output: string | null = await recognize(image);
    setImage(null);
    setLoading(false);
    if (output && output !== "{}") {
      setRecognize(JSON.parse(output));
      setCamera(false);
      setShowForm(true);
    } else {
      setRecognizeError(true);
    }
  };
  return (
    <div>
      <Overlay />
      <div className="transparent-container flex-center">
        <div className="camera-container fade-in">
          <div className="camera-box">
            {image ? (
              <img className="taken-image" src={image} alt="" />
            ) : (
              <Camera
                aspectRatio={16 / 9}
                errorMessages={errorMessages}
                ref={camera}
              />
            )}

            <p>
              Please Hold the item you want to recognize clearly in front of the
              camera
            </p>
            {recognizeError ? (
              <p style={{ color: "red" }}>Failed to recognize the item.</p>
            ) : null}
          </div>
          <IconButton
            disabled={loading}
            color="primary"
            onClick={() => {
              // @ts-ignore
              setImage(camera?.current?.takePhoto());
              // @ts-ignore
              handleRecognize(camera?.current?.takePhoto());
            }}
          >
            <FaCamera />
          </IconButton>
        </div>
      </div>
    </div>
  );
};
export default CameraComponent;
