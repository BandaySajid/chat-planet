import { useState } from "react";
import LogsContext from "./logsContext";

const LogsState = (props) => {
    const [state, setState] = useState([]);

    const setLogs = (log) => {
        setState((prev) => {
            return [...prev, log];
        });
    };
    return (
        <LogsContext.Provider value={{state, setLogs}}>
            {props.children}
        </LogsContext.Provider>
    )
};

export default LogsState;