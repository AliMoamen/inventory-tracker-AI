import "../styles/Dashboard.scss";
import { FaPlus, FaRobot } from "react-icons/fa";
import PantryItem from "./PantryItem";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../Context/UserContext";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import PantryItemForm, { PantryItemInfo } from "./PantryItemForm";
import { signOut } from "firebase/auth";
import CameraComponent from "./Camera";

const Dashboard = () => {
  const { user, showForm, setShowForm, setCamera, camera }: any =
    useContext(UserContext);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [items, setItems] = useState<PantryItemInfo[]>([]);
  const [filteredItems, setFilteredItems] = useState<PantryItemInfo[]>(items);
  const [edit, setEdit] = useState<PantryItemInfo | null>(null);
  const [recognize, setRecognize] = useState<PantryItemInfo | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const getUserInfo = async () => {
      const { uid } = user;
      try {
        const userDoc = await getDoc(doc(db, "userInfo", uid));
        const userInfo = userDoc.data();
        if (userInfo) {
          setFirstName(userInfo.firstName);
          setLastName(userInfo.lastName);
          setItems(userInfo.items);
        }
      } catch (error) {
        console.error("Error Retrieving User Info", error);
        alert("Error Retrieving User Info");
      }
    };

    getUserInfo();
  }, []);

  useEffect(() => {
    const filteredItems = items.filter((pantryItem) => {
      const itemName = pantryItem.itemName.toLowerCase().trim();
      const category = pantryItem.category.toLowerCase().trim();
      const formattedSearch = search.toLowerCase().trim();
      return (
        itemName.includes(formattedSearch) || category.includes(formattedSearch)
      );
    });
    setFilteredItems(filteredItems);
  }, [search, items]);

  const handleSignout = async () => {
    await signOut(auth);
  };

  return (
    <div className="dashboard">
    <div className="header">
      <h1>
        Welcome, {firstName} {lastName}!
      </h1>
      <button className="sign-out" onClick={handleSignout}>Sign Out</button>
    </div>
  
    <div className="search-tools">
      <input
        onChange={(e) => setSearch(e.target.value)}
        className="search-bar"
        type="text"
        placeholder="Search by item name or category"
      />
      <div className="tools">
        <button
          className="add-item-btn"
          onClick={() => {
            setEdit(null);
            setRecognize(null);
            setShowForm(true);
          }}
        >
          <FaPlus className="icon" />
          Add a New Item
        </button>
        <button
          className="recognize-item-btn"
          onClick={() => {
            setEdit(null);
            setRecognize(null);
            setCamera(true);
          }}
        >
          <FaRobot className="icon" /> Recognize Item with AI
        </button>
      </div>
    </div>
  
  
    {camera ? <CameraComponent setRecognize={setRecognize} /> : null}
  
    {showForm ? (
      <PantryItemForm
        edit={edit}
        recognize={recognize}
        setEdit={setEdit}
        items={items}
        setItems={setItems}
      />
    ) : null}
  
    {!items.length ? (
      <div className="error-message">
        <p>Add Items to Inventory</p>
      </div>
    ) : filteredItems.length ? (
      <div className="pantry-grid">
        <div className="pantry-items">
          {filteredItems.map((item, index) => {
            return (
              <PantryItem
                items={items}
                setItems={setItems}
                setEdit={setEdit}
                setRecognize={setRecognize}
                item={item}
                key={index}
              />
            );
          })}
        </div>
      </div>
    ) : (
      <div className="error-message">
        <p>No Item Found</p>
      </div>
    )}
  </div>
  
  );
};

export default Dashboard;
