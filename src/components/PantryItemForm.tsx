import React, { useContext, useState } from "react";
import "../styles/SignInForm.scss";
import {
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
} from "@mui/material";
import Overlay from "./Overlay";
import { UserContext } from "../Context/UserContext";
import { doc, collection, updateDoc } from "firebase/firestore";
import { db, storage } from "../config/firebase";
import generateUniqueId from "generate-unique-id";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { CloudUploadOutlined, StarBorderOutlined } from "@mui/icons-material";
export type PantryItemInfo = {
  itemId: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  generatedImage: boolean;
  imageUrl?: string;
};

const PantryItemForm = ({
  edit,
  recognize,
  items,
  setItems,
  setEdit,
}: {
  edit: PantryItemInfo | null;
  recognize: PantryItemInfo | null;
  items: PantryItemInfo[];
  setItems: React.Dispatch<React.SetStateAction<PantryItemInfo[]>>;
  setEdit: React.Dispatch<React.SetStateAction<PantryItemInfo | null>>;
}) => {
  const { user, setShowForm }: any = useContext(UserContext);
  const { uid } = user;
  const [item, setItem] = useState<PantryItemInfo>(
    recognize
      ? {
          ...recognize,
          itemId: generateUniqueId(),
          quantity: 0,
          unit: "kg",
          generatedImage: false,
        }
      : edit
      ? edit
      : {
          itemId: generateUniqueId(),
          itemName: "",
          category: "",
          quantity: 0,
          unit: "kg",
          generatedImage: false,
        }
  );
  const [image, setImage] = useState<File | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [errors, setErrors] = useState({
    itemName: false,
    category: false,
    quantity: false,
    image: false,
  });
  const [generateError, setGenerateError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loadedStyle, setLoadedStyle] = useState({
    display: "none",
  });

  const handleGenerateImage = async () => {
    if (!item.itemName) {
      setGenerateError(true);
      return;
    }
    if (edit) {
      const imageRef = ref(storage, `images/${uid}/${item.itemId}`);
      try {
        await getDownloadURL(imageRef);
        await deleteObject(imageRef);
      } catch {}
    }
    setLoaded(false);
    setLoadedStyle({
      display: "none",
    });
    setGenerateError(false);
    setImage(null);
    setItem({ ...item, generatedImage: true });
    setGeneratedImage(
      `https://image.pollinations.ai/prompt/generate-realistic-pile-image-of-${item.itemName.replace(
        " ",
        "-"
      )}-${generateUniqueId()}`
    );
  };

  const handleImageUpload = async () => {
    if (!image) return null;
    if (edit) {
      const imageRef = ref(storage, `images/${uid}/${item.itemId}`);
      try {
        await getDownloadURL(imageRef);
        await deleteObject(imageRef);
      } catch {}
    }
    const imageRef = ref(storage, `images/${uid}/${item.itemId}`);
    await uploadBytes(imageRef, image);
    const imageUrl = await getDownloadURL(imageRef);
    return imageUrl;
  };

  const validateFields = () => {
    const newErrors = {
      itemName: !item.itemName,
      category: !item.category,
      quantity: item.quantity <= 0,
      image: !edit && !image && !generatedImage,
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) {
      return;
    }
    const imageUrl = generatedImage
      ? generatedImage
      : await handleImageUpload();
    const itemRef = doc(collection(db, "userInfo"), uid);
    await updateDoc(itemRef, {
      items: [...items, { ...item, imageUrl }],
    });
    if (imageUrl) {
      setItems([...items, { ...item, imageUrl }]);
    }
    setShowForm(false);
    setGeneratedImage(null);
    setItem({
      itemId: generateUniqueId(),
      itemName: "",
      category: "",
      quantity: 0,
      unit: "kg",
      generatedImage: false,
    });
  };
  const handleEditItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) {
      return;
    }
    const imageUrl = generatedImage
      ? generatedImage
      : await handleImageUpload();
    const newItems = items.map((pantryItem) => {
      if (pantryItem.itemId === item.itemId) {
        return imageUrl ? { ...item, imageUrl: imageUrl } : item;
      } else {
        return pantryItem;
      }
    });

    const itemRef = doc(collection(db, "userInfo"), uid);
    await updateDoc(itemRef, {
      items: newItems,
    });
    setShowForm(false);
    setItems(newItems);
    setEdit(null);
  };

  return (
    <>
      <Overlay />
      <div className="transparent-container flex-center">
        <form
          className="form fade-in"
          onSubmit={edit ? handleEditItem : handleAddItem}
          noValidate
        >
          <TextField
            label="Item Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={item.itemName}
            onChange={(e) => setItem({ ...item, itemName: e.target.value })}
            error={errors.itemName || generateError}
            helperText={
              errors.itemName
                ? "Item Name is required"
                : generateError
                ? "Item Name is required to generate the image"
                : ""
            }
          />
          <TextField
            label="Category"
            variant="outlined"
            fullWidth
            margin="normal"
            value={item.category}
            onChange={(e) => setItem({ ...item, category: e.target.value })}
            error={errors.category}
            helperText={errors.category ? "Category is required" : ""}
          />
          <div className="flex-row">
            <TextField
              label="Quantity"
              type="number"
              variant="outlined"
              fullWidth
              margin="normal"
              value={item.quantity}
              onChange={(e) =>
                setItem({ ...item, quantity: parseFloat(e.target.value) })
              }
              error={errors.quantity}
              helperText={
                errors.quantity ? "Quantity must be greater than 0" : ""
              }
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Unit</InputLabel>
              <Select
                value={item.unit}
                onChange={(e) =>
                  setItem({ ...item, unit: e.target.value as string })
                }
              >
                <MenuItem value="kg">kg</MenuItem>
                <MenuItem value="lb">lb</MenuItem>
                <MenuItem value="#">#</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="flex-col">
            {" "}
            <div className="flex-col">
              <Button
                color={errors.image ? "error" : "primary"}
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<CloudUploadOutlined />}
              >
                Upload Image Item
                <input
                  type="file"
                  hidden
                  onChange={(e) => {
                    if (e.target.files) {
                      setImage(e.target.files[0]);
                      setGeneratedImage(null);
                      setItem({ ...item, generatedImage: false });
                    }
                  }}
                />
              </Button>
              {image ? <p>Selected File: {image.name}</p> : null}
              <Button
                color={errors.image ? "error" : "primary"}
                // @ts-ignore
                disabled={!loaded && generatedImage}
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<StarBorderOutlined />}
                onClick={handleGenerateImage}
              >
                Generate Image with AI
              </Button>
            </div>
            {!loaded && generatedImage ? <p>Generating Image ...</p> : null}
            {generatedImage ? (
              <img
                className="generated-image-crop"
                onLoad={() => {
                  setLoaded(true);
                  setLoadedStyle({
                    display: "block",
                  });
                }}
                src={generatedImage}
                style={loadedStyle}
              />
            ) : null}
            <button type="submit">
              {edit ? "Edit Item" : "ADD PANTRY ITEM"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default PantryItemForm;
