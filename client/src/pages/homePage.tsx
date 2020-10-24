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
import { useQuery } from "@apollo/client";
import { IS_LOGGED_IN } from "../apollo";
import Login from "../components/login";
import { logout } from "../apollo/login";

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
  (state: AppState) => state.camp.camps,
  (camps) =>
    camps.map((camp) => ({
      id: camp.id,
      name: camp.name,
    }))
);

const HomePage: React.FC = () => {
  const classes = useStyles();
  const campList = useSelector((state: AppState) => campListSelector(state));
  const { data } = useQuery(IS_LOGGED_IN);
  const isLoggedIn = data.isLoggedIn;
  const [createCampOpen, setCreateCampOpen] = React.useState(false);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const campDispatch = useDispatch<Dispatch<CampActions>>();
  if (isLoggedIn && loginOpen) {
    setLoginOpen(false);
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
              <MenuItem onClick={() => {}}>Synchronize</MenuItem>
            ) : (
              ""
            )}
            {isLoggedIn ? (
              <MenuItem
                onClick={() => {
                  logout();
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
                    campDispatch({ type: "OPEN_CAMP", payload: camp.id })
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
          <Box my={2}>
            <Typography variant="h4" component="h1">
              Test area
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => campDispatch({ type: "CLEAR_CAMP_DATA" })}
            >
              Clear camp data
            </Button>
          </Box>
        </Fragment>
      )}
    </Container>
  );
};

export default HomePage;
