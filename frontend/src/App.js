import 'bootstrap/dist/css/bootstrap.min.css';
import Chat from './components/Chat.js';
import User from './components/User.js';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LogsState from './context/logs/LogsState.js';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageNotFound from './components/PageNotFound.js'

function App() {
  return (
    <LogsState>
      <BrowserRouter>
        <ToastContainer limit={2} autoClose={1000} />
        <Routes>
          <Route path='/' element={<User />}>
          </Route>
          <Route path='/chat' element={<Chat />}>
          </Route>
          <Route path="*" element={<PageNotFound />}>
          </Route>
        </Routes>
      </BrowserRouter>
    </LogsState>
  );
}

export default App;


