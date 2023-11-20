import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ProblemList from "../components/ProblemList";
import { asyncProblemGet } from "../store/ProblemSlice";
import { RootState } from "../store/store";

export default function Home() {
  const dispatch = useDispatch()
  const problems = useSelector((state: RootState) => state.problem.problems)

  useEffect(() => {
    dispatch(asyncProblemGet() as any)
  }, [])

  return (
    <>
      <div className="max-w-4xl mx-auto mb-8">
        <div className="font-mono mt-8">
          <h1 className="text-3xl mb-8">Problemset</h1>
          <div>
            <ProblemList />
          </div>
        </div>
      </div>
      <footer className="fixed bottom-0 left-0">
      </footer>
    </>
  );
}
