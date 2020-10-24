import React, { Dispatch, Fragment } from "react";
import * as Icons from "@material-ui/icons";
import Box from "@material-ui/core/Box/Box";
import Container from "@material-ui/core/Container/Container";
import Typography from "@material-ui/core/Typography/Typography";
import Button from "@material-ui/core/Button";
import {
  AppBar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  TextField,
  Toolbar,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../redux/reducers/rootReducer";
import { CampActions } from "../redux/actions/campActions";
import { createList } from "../model";
import CampListPage from "./campListPage";
import { selectedCampSelector } from "../redux/selectors";

const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginRight: -15,
  },
  appBarTitle: {
    flexGrow: 1,
  },
  menuAddButton: {
    marginRight: -16,
  },
  title: {
    marginTop: 10,
  },
  addListButton: {
    height: 32,
    marginTop: 16,
    marginLeft: 16,
  },
}));

const CampPage: React.FC = () => {
  const classes = useStyles();
  const [createListOpen, setCreateListOpen] = React.useState(false);
  const [newListName, setNewListName] = React.useState("");
  const camp = useSelector((state: AppState) => selectedCampSelector(state));
  const selectedList = useSelector(
    (state: AppState) => state.camp.selectedListId
  );

  const campDispatch = useDispatch<Dispatch<CampActions>>();
  if (!camp) {
    return <Fragment></Fragment>;
  }

  const handleCreateList = () => {
    if (!newListName) {
      return;
    }
    campDispatch({
      type: "USER_OPERATION",
      payload: createList(camp.id, newListName),
    });
    setNewListName("");
  };

  if (selectedList) {
    return <CampListPage />;
  }

  return (
    <Container maxWidth="sm">
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
            onClick={() => campDispatch({ type: "CLOSE_CAMP" })}
          >
            <Icons.ArrowBackIos />
          </IconButton>
          <Typography variant="h6" className={classes.appBarTitle}>
            Home
          </Typography>
          {/* <Button color="inherit" className={classes.menuAddButton}>
            <Icons.Add />
          </Button> */}
        </Toolbar>
      </AppBar>
      <Typography variant="h4" className={classes.title}>
        {camp.name}
      </Typography>
      <Box my={1}>
        {!camp.lists.length && !createListOpen ? (
          <Fragment>
            <Typography variant="h6">Let's make some lists!</Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setCreateListOpen(true)}
            >
              Create a list
            </Button>
          </Fragment>
        ) : (
          <Fragment>
            <Typography variant="h6">Lists</Typography>
            <TextField
              label="Create a new list"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              autoFocus={createListOpen}
              onKeyDown={(e) => {
                if (newListName && e.key === "Enter") {
                  handleCreateList();
                }
              }}
            />
            <Button
              variant="contained"
              color="primary"
              disabled={!newListName}
              className={classes.addListButton}
              onClick={() => handleCreateList()}
            >
              Add list
            </Button>
            <List component="div">
              {camp.lists.map((list) => (
                <ListItem
                  key={list.id}
                  button
                  onClick={() =>
                    campDispatch({
                      type: "OPEN_CAMP_LIST",
                      payload: { campId: camp.id, listId: list.id },
                    })
                  }
                >
                  <ListItemText primary={list.name} />
                </ListItem>
              ))}
            </List>
          </Fragment>
        )}
      </Box>
    </Container>
  );
};

export default CampPage;
