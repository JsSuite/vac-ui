import {
  TextField,
  Box,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@material-ui/core";
import React from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [state, setState] = React.useState({
    username: "",
    vacCentre: "",
    datetime: "",
    nurseCapacity: 0,
    currentSlots: [],
  });
  const [loading, setLoading] = React.useState(false);
  const [operation, setOp] = React.useState("create");
  const [userList, setUserList] = React.useState([]);
  const vacCentre = state.vacCentre;

  React.useEffect(() => {
    setState((state) => ({ ...state, username: "" }));
  }, [operation]);

  React.useEffect(() => {
    const fetchAPI = async () => {
      try {
        setLoading(true);
        const vacCentreAPI = await fetch("http://localhost:5000");

        const result = await vacCentreAPI.json();

        let allUsers = [];
        Object.keys(result).forEach((key) => {
          const userList = result[key].currentSlots.map((v) => ({
            username: v?.registerBy,
            vacCentre: key,
            datetime: v?.datetime,
            nurseCapacity: result[key]?.nurseCapacity,
            currentSlots: result[key]?.currentSlots,
          }));
          allUsers = allUsers.concat(userList);
        });

        setUserList([...allUsers]);
      } catch (ex) {
        console.error(ex.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAPI();
  }, [operation]);

  React.useEffect(() => {
    const fetchAPI = async () => {
      try {
        setLoading(true);
        const vacCentreAPI = await fetch(
          "http://localhost:5000?id=" + vacCentre
        );

        const result = await vacCentreAPI.json();
        setState((state) => ({
          ...state,
          ...result,
        }));
      } catch (ex) {
        console.error(ex.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAPI();
  }, [vacCentre]);

  const handleChange = (key, e) => {
    setState({
      ...state,
      [key]: e.target.value,
    });
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await fetch(
        "http://localhost:5000?id=" +
          vacCentre +
          "&registerBy=" +
          state?.username,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Slot is deleted successfully.");
      setOp("create");
    } catch (ex) {
      console.error(ex.message);
    } finally {
      const vacCentreAPIGet = await fetch("http://localhost:5000");
      const result = await vacCentreAPIGet.json();

      let allUsers = [];
      Object.keys(result).forEach((key) => {
        const userList = result[key].currentSlots.map((v) => ({
          username: v?.registerBy,
          vacCentre: key,
          datetime: v?.datetime,
          nurseCapacity: result[key]?.nurseCapacity,
          currentSlots: result[key]?.currentSlots,
        }));
        allUsers = allUsers.concat(userList);
      });

      setUserList([...allUsers]);
      setLoading(false);
    }
  };

  const handleBook = async () => {
    try {
      setLoading(true);
      if (operation === "edit") {
        const existingVacCentre = userList.find(
          (v) => v.username === state.username
        )?.vacCentre;
        await fetch(
          "http://localhost:5000?fromId=" +
            existingVacCentre +
            "&toId=" +
            vacCentre,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              registerBy: state.username,
              datetime: state.datetime,
            }),
          }
        );
        return toast.success("Slot is updated successfully.");
      }
      const allUsers = userList.map((v) => v.username);
      if (allUsers.includes(state?.username)) {
        return toast.error("This user is already registered.");
      }

      if (
        state.nurseCapacity <=
        state.currentSlots?.filter((v) => v === state?.datetime)?.length
      ) {
        return toast.error("Sorry, this slot is full.");
      }
      await fetch("http://localhost:5000?id=" + vacCentre, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registerBy: state.username,
          datetime: state.datetime,
        }),
      });
      toast.success("Slot is booked successfully.");
    } catch (ex) {
      console.error(ex.message);
    } finally {
      const vacCentreAPIGet = await fetch(
        "http://localhost:5000?id=" + vacCentre
      );

      const result = await vacCentreAPIGet.json();
      setState((state) => ({
        ...state,
        ...result,
      }));
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    const selectedSlot = userList.find((v) => v.username === e.target.value);
    setState({
      ...selectedSlot,
    });
  };

  return (
    <Box
      className="App"
      display="flex"
      flexDirection="row"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      width="100vw">
      <ToastContainer />
      <FormControl component="fieldset">
        <FormLabel component="legend">
          {operation === "create" ? "Create" : "Edit"}
        </FormLabel>
        <RadioGroup
          value={operation}
          name="radio-buttons-group"
          onChange={(e) => setOp(e.target.value)}>
          <FormControlLabel value="create" control={<Radio />} label="Create" />
          <FormControlLabel value="edit" control={<Radio />} label="Edit" />
        </RadioGroup>
      </FormControl>
      <Box width="500px">
        {operation !== "edit" && (
          <>
            <Box padding="20px" maxWidth="500px">
              <TextField
                variant="outlined"
                fullWidth
                value={state?.username}
                label="Username"
                InputLabelProps={{ shrink: true }}
                onChange={(e) => handleChange("username", e)}
              />
            </Box>
            <Box padding="20px" maxWidth="500px">
              <FormControl fullWidth>
                <FormLabel>Vaccination Centre</FormLabel>
                <Select
                  variant="outlined"
                  fullWidth
                  value={state?.vacCentre}
                  onChange={(e) => handleChange("vacCentre", e)}>
                  <MenuItem value="Radin Mas Community Club">
                    Radin Mas Community Club
                  </MenuItem>
                  <MenuItem value="Buona Vista Community Club">
                    Buona Vista Community Club
                  </MenuItem>
                  <MenuItem value="Potong Pasir Community Club">
                    Potong Pasir Community Club
                  </MenuItem>
                  <MenuItem value="Raffles City Convention Centre">
                    Raffles City Convention Centre
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box padding="20px" maxWidth="500px">
              <TextField
                variant="outlined"
                fullWidth
                disabled
                value={state?.nurseCapacity}
                label="Nurse Capacity"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box padding="20px" maxWidth="500px">
              <TextField
                variant="outlined"
                fullWidth
                disabled
                value={
                  state?.currentSlots.filter((v) => v === state.datetime)
                    ?.length
                }
                label="Current Slots"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box padding="20px" maxWidth="500px">
              <FormControl fullWidth>
                <FormLabel>Choose Time Slots</FormLabel>
                <Select
                  variant="outlined"
                  fullWidth
                  value={state?.datetime}
                  onChange={(e) => handleChange("datetime", e)}>
                  <MenuItem value="12pm - 1pm">12pm - 1pm</MenuItem>
                  <MenuItem value="1pm - 2pm">1pm - 2pm</MenuItem>
                  <MenuItem value="2pm - 3pm">2pm - 3pm</MenuItem>
                  <MenuItem value="3pm - 4pm">3pm - 4pm</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </>
        )}
        {operation === "edit" && (
          <>
            <Box padding="20px" maxWidth="500px">
              <FormControl fullWidth>
                <FormLabel>Username</FormLabel>
                <Select
                  variant="outlined"
                  fullWidth
                  value={state?.username}
                  onChange={(e) => handleEditChange(e)}>
                  {userList.map((user) => (
                    <MenuItem value={user.username}>{user.username}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            {!!state?.username && (
              <>
                <Box padding="20px" maxWidth="500px">
                  <FormControl fullWidth>
                    <FormLabel>Vaccination Centre</FormLabel>
                    <Select
                      variant="outlined"
                      fullWidth
                      value={state?.vacCentre}
                      onChange={(e) => handleChange("vacCentre", e)}>
                      <MenuItem value="Radin Mas Community Club">
                        Radin Mas Community Club
                      </MenuItem>
                      <MenuItem value="Buona Vista Community Club">
                        Buona Vista Community Club
                      </MenuItem>
                      <MenuItem value="Potong Pasir Community Club">
                        Potong Pasir Community Club
                      </MenuItem>
                      <MenuItem value="Raffles City Convention Centre">
                        Raffles City Convention Centre
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Box padding="20px" maxWidth="500px">
                  <TextField
                    variant="outlined"
                    fullWidth
                    disabled
                    value={state?.nurseCapacity}
                    label="Nurse Capacity"
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <Box padding="20px" maxWidth="500px">
                  <TextField
                    variant="outlined"
                    fullWidth
                    disabled
                    value={
                      state?.currentSlots.filter((v) => v === state.datetime)
                        ?.length
                    }
                    label="Current Slots"
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <Box padding="20px" maxWidth="500px">
                  <FormControl fullWidth>
                    <FormLabel>Choose Time Slots</FormLabel>
                    <Select
                      variant="outlined"
                      fullWidth
                      value={state?.datetime}
                      onChange={(e) => handleChange("datetime", e)}>
                      <MenuItem value="12pm - 1pm">12pm - 1pm</MenuItem>
                      <MenuItem value="1pm - 2pm">1pm - 2pm</MenuItem>
                      <MenuItem value="2pm - 3pm">2pm - 3pm</MenuItem>
                      <MenuItem value="3pm - 4pm">3pm - 4pm</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </>
            )}
          </>
        )}
        <Box width="100%" height="50px" display="flex" justifyContent="center">
          <Button
            className="m"
            color="primary"
            variant="contained"
            disabled={loading}
            onClick={handleBook}>
            {loading
              ? "Loading..."
              : operation === "edit"
              ? "Update Slot"
              : "Book Slot"}
          </Button>
          {operation === "edit" && (
            <Button
              className="m"
              color="primary"
              variant="outlined"
              disabled={loading}
              onClick={handleDelete}>
              {loading ? "Deleting..." : "Delete"}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default App;
