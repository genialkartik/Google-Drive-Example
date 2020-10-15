import React from 'react';
import { Link, Redirect } from 'react-router-dom'
import axios from 'axios'

import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import DashboardIcon from '@material-ui/icons/Dashboard';
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd';
import SubscriptionsIcon from '@material-ui/icons/Subscriptions';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import InfoIcon from '@material-ui/icons/Info';

export const mainListItems = (
  <div>
    <Link to={`/`}>
      <ListItem button>
        <ListItemIcon>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItem>
    </Link>

    <Link to={`/subscriptions`}>
      <ListItem button>
        <ListItemIcon>
          <SubscriptionsIcon />
        </ListItemIcon>
        <ListItemText primary="Subscriptions" />
      </ListItem>
    </Link>

    <Link to={`/user/login`}>
      <ListItem button>
        <ListItemIcon>
          <AccountCircleIcon />
        </ListItemIcon>
        <ListItemText primary="Log In" />
      </ListItem>
    </Link>

    <Link to={`/user/signup`}>
      <ListItem button>
        <ListItemIcon>
          <AssignmentIndIcon />
        </ListItemIcon>
        <ListItemText primary="Sign Up" />
      </ListItem>
    </Link>

    <Link to={`/about`}>
      <ListItem button>
        <ListItemIcon>
          <InfoIcon />
        </ListItemIcon>
        <ListItemText primary="About" />
      </ListItem>
    </Link>

    <ListItem button
      onClick={() => {
        axios.get('/user/logout')
          .then(res => {
            alert(res.data.msg)
            window.location.replace('/')
          })
      }}
    >
      <ListItemIcon>
        <AssignmentIndIcon />
      </ListItemIcon>
      <ListItemText primary="Logout" />
    </ListItem>
  </div>
);