import React, { Dispatch, Fragment } from "react";
import * as Icons from "@material-ui/icons";
import Box from "@material-ui/core/Box/Box";
import Container from "@material-ui/core/Container/Container";
import Typography from "@material-ui/core/Typography/Typography";
import Button from "@material-ui/core/Button";
import {
  AppBar,
  Checkbox,
  IconButton,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Menu,
  MenuItem,
  Select,
  TextField,
  Toolbar,
} from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { AppState } from "../redux/reducers/rootReducer";
import { CampActions } from "../redux/actions/campActions";
import {
  changeItemDeleted,
  changeItemState,
  createItem
} from "../model";
import { ItemState } from "desert-thing-packing-list-common";
import { createSelector } from "reselect";
import { selectedCampSelector, selectedListSelector } from "../redux/selectors";
import { AppThunk, userOperationAction } from "../redux/actions/appActions";
import { useApolloClient, ApolloClient, NormalizedCacheObject } from "@apollo/client";

const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginRight: -15,
  },
  appBarTitle: {
    flexGrow: 1,
  },
  menuActionButton: {
    marginRight: -16,
  },
  title: {
    marginTop: 10,
  },
  addItemButton: {
    height: 32,
    marginTop: 16,
    marginLeft: 16,
  },
  itemStateSelector: {
    height: 32,
  },
  actionButton: {
    marginRight: 6,
  },
}));

const itemsViewSelector = createSelector(
  (state: AppState) => selectedListSelector(state)?.items,
  (state: AppState, checkedIds: string[]) => checkedIds,
  (items, checkedIds) =>
    items
      ?.filter((item) => !item.deleted)
      .map((item) => ({
        ...item,
        checked: checkedIds.indexOf(item.id) >= 0,
      }))
);

const CampListPage: React.FC = () => {
  const classes = useStyles();
  const [newItemName, setNewItemName] = React.useState("");
  const [
    appbarAnchorEl,
    setAppbarAnchorEl,
  ] = React.useState<null | HTMLElement>(null);
  const [setToAnchorEl, setSetToAnchorEl] = React.useState<null | HTMLElement>(
    null
  );
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
  const camp = useSelector((state: AppState) => selectedCampSelector(state));
  const list = useSelector((state: AppState) => selectedListSelector(state));
  // Add 'checked' property and filter out deleted items
  const itemsView = useSelector((state: AppState) =>
    itemsViewSelector(state, selectedItems)
  );

  const dispatch = useDispatch<Dispatch<CampActions | AppThunk>>();
  const client = useApolloClient() as ApolloClient<NormalizedCacheObject>;

  if (!camp || !list) {
    // Assert?
    return <Fragment></Fragment>;
  }

  const handleCreateItem = () => {
    if (!newItemName) {
      return;
    }
    dispatch(userOperationAction(client, camp.id, createItem(list.id, newItemName)));
    setNewItemName("");
  };

  const handleSelectAll = () => {
    setSelectedItems(itemsView?.map((item) => item.id) || []);
    setAppbarAnchorEl(null);
  };

  const handleUnselectAll = () => {
    setSelectedItems([]);
    setAppbarAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAppbarAnchorEl(null);
  };

  const handleBulkChangeItemState = (itemState: ItemState) => () => {
    if (selectedItems.length) {
      dispatch(
        userOperationAction(
          client,
          camp.id,
          changeItemState(list.id, selectedItems, itemState)
        )
      );
    }
    setSelectedItems([]);
    setSetToAnchorEl(null);
  };

  const handleBulkDeleteItems = () => {
    if (selectedItems.length) {
      dispatch(
        userOperationAction(
          client,
          camp.id,
          changeItemDeleted(list.id, selectedItems, true)
        )
      );
    }
    setSelectedItems([]);
  };

  const handleCheckboxChange = (itemId: string) => (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter((i) => i !== itemId));
    }
  };

  return (
    <Container maxWidth="sm">
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="back"
            onClick={() => dispatch({ type: "CLOSE_CAMP_LIST" })}
          >
            <Icons.ArrowBackIos />
          </IconButton>
          <Typography variant="h6" className={classes.appBarTitle}>
            {camp.name}
          </Typography>
          <Button
            color="inherit"
            aria-controls="simple-menu"
            aria-haspopup="true"
            onClick={(e) => {
              setAppbarAnchorEl(e.currentTarget);
            }}
            className={classes.menuActionButton}
          >
            <Icons.MoreVert />
          </Button>
          <Menu
            anchorEl={appbarAnchorEl}
            keepMounted
            open={Boolean(appbarAnchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={handleSelectAll}
              disabled={selectedItems.length === itemsView?.length}
            >
              Select all
            </MenuItem>
            <MenuItem
              onClick={handleUnselectAll}
              disabled={selectedItems.length === 0}
            >
              Unselect all
            </MenuItem>
            <MenuItem onClick={handleMenuClose} disabled>
              Show deleted items
            </MenuItem>
            <MenuItem onClick={handleMenuClose} disabled>
              Assign list to...
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Typography variant="h4" gutterBottom className={classes.title}>
        {list.name}
      </Typography>
      <Box my={1}>
        {selectedItems.length === 0 ? (
          <Box height={48}>
            <TextField
              label="Add a new item"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (newItemName && e.key === "Enter") {
                  handleCreateItem();
                }
              }}
            />
            <Button
              variant="outlined"
              color="primary"
              disabled={!newItemName}
              className={classes.addItemButton}
              onClick={() => handleCreateItem()}
            >
              Add item
            </Button>
          </Box>
        ) : (
          <Box height={48}>
            <Button
              variant="outlined"
              className={classes.actionButton}
              onClick={(e) => {
                setSetToAnchorEl(e.currentTarget);
              }}
            >
              Set to...
            </Button>
            <Button
              variant="outlined"
              className={classes.actionButton}
              disabled
            >
              Assign to...
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleBulkDeleteItems}
            >
              Delete
            </Button>
            <Menu
              anchorEl={setToAnchorEl}
              keepMounted
              open={Boolean(setToAnchorEl)}
              onClose={() => setSetToAnchorEl(null)}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              <MenuItem
                onClick={handleBulkChangeItemState(ItemState.UNPURCHASED)}
              >
                Unpurchased
              </MenuItem>
              <MenuItem
                onClick={handleBulkChangeItemState(ItemState.PURCHASED)}
              >
                Purchased
              </MenuItem>
              <MenuItem onClick={handleBulkChangeItemState(ItemState.PACKEDIN)}>
                Packed (in)
              </MenuItem>
              <MenuItem
                onClick={handleBulkChangeItemState(ItemState.PACKEDOUT)}
              >
                Packed (out)
              </MenuItem>
            </Menu>
          </Box>
        )}
        <List component="div">
          {itemsView?.map((item) => (
            <ListItem key={item.id}>
              <Checkbox
                checked={item.checked}
                onChange={handleCheckboxChange(item.id)}
                color="primary"
              />
              <ListItemText primary={item.name} />
              <Select
                value={item.state}
                variant="outlined"
                className={classes.itemStateSelector}
                onChange={(event) =>
                  dispatch(
                    userOperationAction(
                      client,
                      camp.id,
                      changeItemState(
                        list.id,
                        [item.id],
                        event.target.value as ItemState
                      )
                    )
                  )
                }
              >
                <MenuItem value={ItemState.UNPURCHASED}>Unpurchased</MenuItem>
                <MenuItem value={ItemState.PURCHASED}>Purchased</MenuItem>
                <MenuItem value={ItemState.PACKEDIN}>Packed (In)</MenuItem>
                <MenuItem value={ItemState.PACKEDOUT}>Packed (Out)</MenuItem>
              </Select>
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
};

export default CampListPage;
