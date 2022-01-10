import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom" ;
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import MatchesScreen from './screens/MatchesScreen';
import ChatScreen from './screens/ChatScreen';
import RequireLogin from './components/RequireLogin';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App/>} />
          <Route path="/matches" element={
            <RequireLogin>
              <MatchesScreen/>
            </RequireLogin>
          } />
          <Route path="/chat" element={
            <RequireLogin>
              <ChatScreen/>
            </RequireLogin>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
