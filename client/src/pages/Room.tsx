import React, { useEffect, useState, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import AllSubmission from "../components/AllSubmission";
import ProblemEditor from "../components/ProblemEditor";
import ProblemStatement from "../components/ProblemStatement";
import { asyncSingleProblemGet } from "../store/ProblemSlice";
import { RootState } from "../store/store";
import {socket} from "../socket"
import { createNextState } from "@reduxjs/toolkit";

function Room() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  let location = ""; 
  let cur = "";

  useEffect(() => {
    socket.emit("roomjoin", searchParams.get("id"));
    cur = searchParams.get('id') as any;
    socket.on("problemId", (problemId: any) => {
      location = problemId;
      dispatch(asyncSingleProblemGet(location) as any);
    })
  }, [searchParams]);

  useEffect(() => {
    socket.on('newmessage', (message: any) => {
      setMessages(messages  => { return [...messages, message] as any });
    })
  }, []);

  const handleSubmit = (event: any) => {
    event.preventDefault();
    setMessages(messages  => { return [...messages, inputValue] as any });
    socket.emit("sendmessage", inputValue);
  };

  return (
    <div className="flex">
      <div className="flex-initial w-[35%] h-screen overflow-y-auto sc1 problemPage pb-2 relative">
        <div className="flex items-center font-mono font-bold justify-around fixed top-0 z-20 bg-[whitesmoke] shadow  h-full flex-col w-10">
        </div>
        <div className="px-4 pl-16 mt-4">
            <ProblemStatement />
        </div>
      </div>
      <div className="flex-initial w-[45%]">
        <ProblemEditor />
      </div>
      <div className="flex w-[20%] max-h-[calc(100vh-85px)] flex-col justify-end p-4 border-l-2 border-gray-300  ">
        <div className="mb-4 overflow-y-auto mt-4">
          <ul className="flex flex-col justify-end">
            {messages.map((message, idx) => (
              <li key={idx} className={`"bg-gray-100" p-1 px-2 rounded break-words`}>
                <span className="font-bold">{user?.displayName}</span> {message}
              </li>
            ))}
          </ul>
        </div>
        <form 
          className="w-full"
          onSubmit={handleSubmit}
        >
          <input
            className="border border-gray-500 rounded p-2 w-full max-w-full"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
          />
        </form>
      </div>
    </div>
  );
}

export default Room;
