import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Route, Routes, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import AddProblem from "./pages/AddProblem";
import Home from "./pages/Home";
import ProblemPage from "./pages/ProblemPage";
import Room from "./pages/Room";
import { asyncLogin } from "./store/authSlice";
import { socket } from "./socket";


function App() {
  const [isConnected, setIsConnected] = useState(socket.connected); 
  const dispatch = useDispatch()
  const navigate = useNavigate();

  useEffect(() => {

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onRoomCreate(ID: any) {
      navigate('/room?id='+ID);
    }

    console.log("potat");
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('roomcreated', onRoomCreate);
    
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('roomcreated', onRoomCreate);
    };
  }, [])

  useEffect(() => {
    dispatch(asyncLogin() as any) 
  }, []);


  return (
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/problem/:id" element={<ProblemPage />} />
          <Route path="/create" element={<AddProblem />} />
          <Route path="/room" element={<Room />} />
        </Routes>
      </div>
  );
}

export default App;
