import React, { Dispatch } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  Grid,
  makeStyles,
  TextField,
} from "@material-ui/core";
import { useDispatch } from "react-redux";
import { createCamp } from "../model";
import { CampActions } from "../redux/actions/campActions";

const useStyles = makeStyles((theme) => ({
  textfield: {
    margin: theme.spacing(2),
    textAlign: "center",
  },
  button: {
    margin: theme.spacing(2),
  },
}));

interface CreateCampProps {
  onClose: () => void;
  open: boolean;
}

const CreateCamp: React.FC<CreateCampProps> = (props) => {
  const classes = useStyles();
  const { onClose, open } = props;
  const [campName, setCampName] = React.useState("");
  const campsDispatch = useDispatch<Dispatch<CampActions>>();

  const handleCreate = () => {
    campsDispatch({
      type: "USER_OPERATION",
      ...createCamp(campName),
    });
    setCampName("");
    onClose();
  };

  return (
    <Dialog
      onClose={() => onClose()}
      aria-labelledby="simple-dialog-title"
      open={open}
      maxWidth="xs"
    >
      <Box p={4}>
        <DialogTitle id="simple-dialog-title">Create a camp</DialogTitle>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Camp name"
              value={campName}
              onChange={(e) => setCampName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (campName && e.key === "Enter") {
                  handleCreate();
                }
              }}
              className={classes.textfield}
            />
          </Grid>
          <Grid item xs="auto">
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreate}
              disabled={!campName}
              className={classes.button}
            >
              Create
            </Button>
          </Grid>
          <Grid item xs="auto">
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                setCampName("");
                onClose();
              }}
              className={classes.button}
            >
              Cancel
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Dialog>
  );
};

export default CreateCamp;
