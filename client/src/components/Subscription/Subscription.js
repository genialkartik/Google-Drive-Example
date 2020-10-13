import React, { useEffect } from 'react'
import axios from 'axios'
import { withRouter, Redirect } from 'react-router-dom'
import queryString from 'query-string'
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Button from '@material-ui/core/Button'
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
// subscription list
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Avatar from '@material-ui/core/Avatar';

import { mainListItems } from '../includes/listItems';
import Title from '../includes/Title';
import { set } from 'mongoose';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    verticalAlign: 'center',
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  subscriptionlist: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
  inline: {
    display: 'inline',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

function Subscription(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);
  const [redirect, setRedirect] = React.useState(false)
  const [redirectURL, setRedirectURL] = React.useState('/')
  const [sheetsList, setAddSheetsList] = React.useState('');
  const [subsList, setSubsList] = React.useState([])
  const [tabsList, setTabsList] = React.useState()
  const [currSubscription, setCurrSub] = React.useState('')
  const [currTab, setCurrTab] = React.useState('')
  const [currSheet, setCurrSheet] = React.useState('')

  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    console.log(props.location)
    let params = queryString.parse(props.location.search)
    console.log(params.scope)
    if (params.code) {
      axios.post('/subscriptions', {
        code: params.code
      })
        .then(res => {
          alert(res.data.msg)
          setRedirectURL('/subscriptions')
          setRedirect(true)
        })
    }
    else {
      axios.get('/subscriptions')
        .then(res => {
          if (res.data.status === 0) {
            alert(res.data.msg)
            setRedirectURL('/user/login')
            setRedirect(true)
          } else {
            if (res.data.subfiles.length) {
              setSubsList(res.data.subfiles)
            }
          }
        })
    }
  }, [props.location])

  const addSubscription = () => {
    axios.get('/subscriptions/add-sub')
      .then(res => {
        if (res.data.status === 2) {
          setRedirectURL(res.data.authURL)
          setRedirect(true)
        }
        if (res.data.status === 1) {
          console.log(res.data)
        }
      })
  }

  const addSpreadSheet = () => {
    axios.post(`/subscriptions/add-sheet`, {
      sheetId: currSheet,
      tabId: currTab,
      subsId: currSubscription
    })
      .then(res => {
        alert(res.data.msg)
        setRedirectURL('/')
        setRedirect(true)
      })
  }

  return (
    <div className={classes.root}>
      {(redirect) ?
        <>
          <Redirect to={redirectURL} />
        </> :
        <>
          <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
            <Toolbar className={classes.toolbar}>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
              >
                <MenuIcon />
              </IconButton>
              <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
                Subscriptions
        </Typography>
            </Toolbar>
          </AppBar>
          <Drawer
            variant="permanent"
            classes={{
              paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
            }}
            open={open}
          >
            <div className={classes.toolbarIcon}>
              <IconButton onClick={handleDrawerClose}>
                <ChevronLeftIcon />
              </IconButton>
            </div>
            <Divider />
            <List>{mainListItems}</List>
            <Divider />
          </Drawer>

          <main className={classes.content}>
            <div className={classes.appBarSpacer} />
            <Container maxWidth="lg" className={classes.container}>
              {/* Recent Deposits */}
              <Grid item xs={12} md={4} lg={3}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={addSubscription}
                >Add Subscription</Button>
              </Grid><br />
              <Grid container spacing={3}>
                {/* Chart */}
                <Grid item xs={12}>
                  <Paper>
                    <Title>Subscriptions List</Title>
                    <List className={classes.subscriptionlist}>
                      {(subsList.length) && ////////////////////////// List of Subscriptions
                        subsList.map(({ subscriptionId, userDetails, sheetCount }) => (
                          <ListItem alignItems="flex-start"
                            style={{ cursor: 'pointer' }}
                            onClick={                           //// Open add Sheet Form
                              () => {
                                setCurrSub(subscriptionId)
                                axios.get(`/subscriptions/sheetform/${subscriptionId}`)
                                  .then(res => {
                                    console.log(res.data)
                                    setAddSheetsList(res.data.subfiles)
                                    setCurrSub(res.data.subsId)
                                  })
                              }
                            }
                          >
                            <ListItemAvatar>
                              <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
                            </ListItemAvatar>
                            <ListItemText
                              primary={subscriptionId}
                              secondary={
                                <React.Fragment>
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    className={classes.inline}
                                    color="textPrimary"
                                  >
                                    {userDetails.displayName}
                                  </Typography>
                                  {" ~ Added on 20/20/2020"}
                                </React.Fragment>
                              }
                            />
                            <span edge="end">
                              Total Sheets: {sheetCount}
                            </span>
                          </ListItem>
                        ))
                      }
                      <Divider variant="inset" component="li" />
                    </List>
                  </Paper>
                </Grid>
                {/* Recent Orders */}
                <br />
              </Grid>
            </Container>

            <CssBaseline />
            <Container maxWidth="sm">
              {(currSubscription && sheetsList) ?
                <div>
                  <h2>Add a Sheet from Subscription</h2>
                  <Title>{currSubscription}</Title>
                  <br />
                  <label>Select Sheet name:</label><br />
                  {sheetsList.map(({ sheets }) => (
                    <select name="spreadsheet" id="spreadsheet"
                      onChange={(e) => {
                        setCurrSheet(e.target.value)
                        axios.get(`/subscriptions/add-sheet/${currSubscription}/${e.target.value}`)
                          .then(res => {
                            setTabsList(res.data.tablist)
                          })
                      }}>
                      <option value={'select'}></option>
                      {sheets.map(({ id, name }) => (
                        <option value={id}>{name}</option>
                      ))}
                    </select>
                  ))}
                  {(tabsList) &&
                    <div>
                      <label>Select Tab name:</label><br />
                      <select name="spreadsheet" id="spreadsheet"
                        onChange={(e) => {
                          setCurrTab(e.target.value)
                        }}>
                        <option value={'select'}></option>
                        {tabsList.map((tab) => (
                          <option value={tab}>{tab}</option>
                        ))}
                      </select>
                      <br />
                      <br />
                      <Button
                        color="secondary"
                        variant="contained"
                        size="large"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={addSpreadSheet}
                      >Add SpreadSheet</Button>
                    </div>
                  }
                </div> :
                <div>
                  <Title>Select/Add any Subscription to Add SpreadSheet!</Title>
                </div>
              }
            </Container>
          </main>
        </>
      }
    </div>
  )
}

export default withRouter(Subscription)