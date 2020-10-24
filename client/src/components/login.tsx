import React, { createRef } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  Grid,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import { useLoginMutation } from "../apollo/login";

const useStyles = makeStyles((theme) => ({
  textfield: {
    margin: theme.spacing(2),
    textAlign: "center",
  },
  button: {
    margin: theme.spacing(2),
  },
}));

interface LoginProps {
  onClose: () => void;
  open: boolean;
}

const Login: React.FC<LoginProps> = (props) => {
  const classes = useStyles();
  const { onClose, open } = props;
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const passwordRef = createRef<HTMLDivElement>();

  const [login, { loading, error }] = useLoginMutation();

  if (!open && (email || password)) {
    setEmail("");
    setPassword("");
  }

  const handleLogin = () => {
    login({ variables: { email, password } });
  };

  return (
    <Dialog
      onClose={() => onClose()}
      aria-labelledby="simple-dialog-title"
      open={open}
      maxWidth="xs"
    >
      <Box p={4}>
        <DialogTitle id="simple-dialog-title">Sign in</DialogTitle>
        {/* Need to use a form so that the browser saves the password */}
        <form noValidate onSubmit={(e: any) => e.preventDefault()}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Email or username"
                value={email}
                id="email"
                name="email"
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (email && e.key === "Enter") {
                    passwordRef.current?.focus();
                  }
                }}
                className={classes.textfield}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                ref={passwordRef}
                label="Password"
                value={password}
                name="password"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (password && e.key === "Enter") {
                    handleLogin();
                  }
                }}
                className={classes.textfield}
              />
            </Grid>
            <Grid item xs="auto">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!email || !password}
                className={classes.button}
                onClick={handleLogin}
              >
                Log in
              </Button>
            </Grid>
            <Grid item xs="auto">
              <Button
                variant="outlined"
                color="primary"
                onClick={onClose}
                className={classes.button}
              >
                Cancel
              </Button>
            </Grid>
            <Grid xs="auto">
              <Typography variant="subtitle1">{error?.message}</Typography>
              <Typography variant="subtitle1">
                {loading ? "Working..." : ""}
              </Typography>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Dialog>
  );
};

export default Login;
