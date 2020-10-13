import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import './App.css';

import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Login/Login'
import Signup from './components/Signup/Signup'
import Subscription from './components/Subscription/Subscription'
import About from './components/About/About'

function App() {
  return (
    <div className="App">
      <Router>
        <Route path="/" exact component={Dashboard} />
        <Route path="/about" exact component={About} />
        <Route path="/user/login" exact component={Login} />
        <Route path="/user/signup" exact component={Signup} />
        <Route path="/subscriptions" exact component={Subscription} />
      </Router>
    </div>
  );
}

export default App;