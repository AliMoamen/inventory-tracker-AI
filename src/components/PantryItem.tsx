import "../styles/PantryItem.scss";
import { FaPenToSquare, FaTrash } from "react-icons/fa6";
import { PantryItemInfo } from "./PantryItemForm";
import { collection, doc, updateDoc } from "firebase/firestore";
import { db, storage } from "../config/firebase";
import { useContext } from "react";
import { UserContext } from "../Context/UserContext";
import { deleteObject, getDownloadURL, ref } from "firebase/storage";
const PantryItem = ({
  items,
  setItems,
  setEdit,
  setRecognize,
  item,
}: {
  items: PantryItemInfo[];
  setItems: React.Dispatch<React.SetStateAction<PantryItemInfo[]>>;
  setEdit: React.Dispatch<React.SetStateAction<PantryItemInfo | null>>;
  setRecognize: React.Dispatch<React.SetStateAction<PantryItemInfo | null>>;
  item: PantryItemInfo;
}) => {
  const { user, setShowForm }: any = useContext(UserContext);
  const { uid } = user;
  const handleDelete = async (id: string) => {
    const newItems = items.filter((pantryItem) => pantryItem.itemId !== id);
    const itemRef = doc(collection(db, "userInfo"), uid);
    await updateDoc(itemRef, {
      items: newItems,
    });
    try {
      const imageRef = ref(storage, `images/${uid}/${id}`);
      await getDownloadURL(imageRef);
      await deleteObject(imageRef);
    } catch {}

    setItems(newItems);
  };

  return (
    <div className="pantry-item">
      <img src={item.imageUrl} />
      <div className="item-info">
        <div className="item-content">
          <div className="item-header">
            <p>{item.itemName}</p>
            <p className="quantity">
              {item.quantity} {item.unit}
            </p>
          </div>
          <p className="category">{item.category}</p>
        </div>

        <div className="item-tools">
          <button
            onClick={() => {
              setRecognize(null);
              setEdit(item);
              setShowForm(true);
            }}
          >
            <FaPenToSquare />
          </button>
          <button onClick={() => handleDelete(item.itemId)}>
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  );
};
export default PantryItem;
