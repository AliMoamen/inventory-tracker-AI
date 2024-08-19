import { useContext } from "react";
import "../styles/Home.scss";
import { Form } from "./Form";
import { UserContext } from "../Context/UserContext";

const Home = () => {
  const { showForm, setShowForm }: any = useContext(UserContext);
  return (
    <>
      <div className="area">
        <div className="flex-col flex-center">
          <h1>AI Inventory Tracker</h1>
          <p>Reimagine the way of tracking your inventory</p>
          <button onClick={() => setShowForm(true)}>Get Started</button>;
        </div>
        {showForm ? <Form /> : null}
      </div>
    </>
  );
};

export default Home;
