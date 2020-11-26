import React, { Dispatch, Fragment } from "react";
import * as Icons from "@material-ui/icons";
import Box from "@material-ui/core/Box/Box";
import Container from "@material-ui/core/Container/Container";
import Typography from "@material-ui/core/Typography/Typography";
import Button from "@material-ui/core/Button";
import {
  AppBar,
  Grid,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Menu,
  MenuItem,
  Toolbar,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../redux/reducers/rootReducer";
import CreateCamp from "../components/createCamp";
import { CampActions } from "../redux/actions/campActions";
import { createSelector } from "reselect";
import Login from "../components/login";
import { UserActions } from "../redux/actions/userActions";
import { AppThunk, synchronizeCampsAction } from "../redux/actions/appActions";
import { ApolloClient, NormalizedCacheObject, useApolloClient } from "@apollo/client";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  menuActionButton: {
    marginRight: -16,
  },
  title: {
    flexGrow: 1,
  },
}));

const campListSelector = createSelector(
  (state: AppState) => state.camp.campManagers,
  (campManagers) =>
    campManagers.map((campManager) => ({
      id: campManager.campId,
      name: campManager.current.name,
    }))
);

const HomePage: React.FC = () => {
  const classes = useStyles();
  const campList = useSelector((state: AppState) => campListSelector(state));
  const isLoggedIn = useSelector((state: AppState) => !!state.user.token);
  const [createCampOpen, setCreateCampOpen] = React.useState(false);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const dispatch = useDispatch<Dispatch<CampActions | AppThunk | UserActions>>();
  const client = useApolloClient() as ApolloClient<NormalizedCacheObject>;

  const handleSynchronize = () => {
    dispatch(synchronizeCampsAction(client));
  }

  return (
    <Container maxWidth="sm">
      <CreateCamp
        open={createCampOpen}
        onClose={() => setCreateCampOpen(false)}
      />
      <Login open={loginOpen} onClose={() => setLoginOpen(false)} />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Home
          </Typography>
          <Button
            color="inherit"
            onClick={(e) => {
              setAnchorEl(e.currentTarget);
            }}
            className={classes.menuActionButton}
            data-testid="menu-open"
          >
            <Icons.MoreVert />
          </Button>
          <Menu
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            {!isLoggedIn ? (
              <MenuItem
                onClick={() => {
                  setLoginOpen(true);
                  setAnchorEl(null);
                }}
                data-testid="open-login"
              >
                Log in
              </MenuItem>
            ) : (
              ""
            )}
            <MenuItem
              onClick={() => {
                setCreateCampOpen(true);
                setAnchorEl(null);
              }}
            >
              Create a camp
            </MenuItem>
            <MenuItem disabled>Join a camp</MenuItem>
            <MenuItem disabled>Create a private list</MenuItem>
            {isLoggedIn ? (
              <MenuItem onClick={handleSynchronize} data-testid="sync-button">Synchronize</MenuItem>
            ) : (
              ""
            )}
            {isLoggedIn ? (
              <MenuItem
                onClick={() => {
                  dispatch({type: "LOGOUT"})
                  setAnchorEl(null);
                }}
              >
                Log out
              </MenuItem>
            ) : (
              ""
            )}
          </Menu>
        </Toolbar>
      </AppBar>

      {!campList.length ? (
        <Box my={2}>
          <Typography variant="h4" component="h1" gutterBottom>
            Let's get started!
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setCreateCampOpen(true)}
              >
                Create a camp
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setCreateCampOpen(true)}
                disabled
              >
                Join a camp
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setCreateCampOpen(true)}
                disabled
              >
                Create a private list
              </Button>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Fragment>
          <Box my={2}>
            <Typography variant="h4" component="h1">
              Camps
            </Typography>
            <List component="div">
              {campList.map((camp) => (
                <ListItem
                  key={camp.id}
                  button
                  onClick={() =>
                    dispatch({ type: "OPEN_CAMP", payload: camp.id })
                  }
                >
                  <ListItemText primary={camp.name} />
                </ListItem>
              ))}
            </List>
          </Box>
          <Box my={2}>
            <Typography variant="h4" component="h1">
              Private lists
            </Typography>
            <Typography variant="subtitle1">Coming soon</Typography>
          </Box>
        </Fragment>
      )}
    </Container>
  );
};

export default HomePage;
