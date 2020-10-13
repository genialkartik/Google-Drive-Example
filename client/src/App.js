import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import './App.css';

import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Login/login'
import Signup from './components/Signup/signup'
import Subscription from './components/Subscription/subscription'
import About from './components/About/about'

function App() {
  return (
    <div className="App">
      <Router>
        <Route path="/" exact component={Dashboard} />
        <Route path="/user/login" exact component={Login} />
        <Route path="/user/signup" component={Signup} />
        <Route path="/subscriptions" component={Subscription} />
        <Route path="/about" component={About} />
      </Router>
    </div>
  );
}

export default App;