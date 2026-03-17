import { useEffect, useState } from "react";
import { getUsers, deleteUser, updateRole } from "../api/adminApi";
import { useNavigate } from "react-router-dom";

import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogActions,
  TextField
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";

const drawerWidth = 220;

export default function AdminDashboard() {

  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [roleUserId, setRoleUserId] = useState(null);
  const [role, setRole] = useState("");

  const loadUsers = async () => {

    try {

      const res = await getUsers();

      setUsers(res.data);

    } catch (err) {

      alert("Unauthorized");

      logout();
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const logout = () => {

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    navigate("/");
  };

  const confirmDelete = async () => {

    await deleteUser(deleteId);

    setDeleteId(null);

    loadUsers();
  };

  const confirmChangeRole = async () => {

    await updateRole(roleUserId, role);

    setRoleUserId(null);
    setRole("");

    loadUsers();
  };

  const columns = [
    { field: "id", headerName: "ID", width: 90 },

    { field: "email", headerName: "Email", width: 250 },

    {
      field: "role",
      headerName: "Role",
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === "admin" ? "error" : "primary"}
        />
      )
    },

    {
      field: "is_verified",
      headerName: "Verified",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Yes" : "No"}
          color={params.value ? "success" : "default"}
        />
      )
    },

    {
      field: "actions",
      headerName: "Actions",
      width: 220,
      renderCell: (params) => (

        <>

          <Button
            variant="outlined"
            size="small"
            onClick={() => setRoleUserId(params.row.id)}
          >
            Change Role
          </Button>

          <Button
            variant="contained"
            color="error"
            size="small"
            sx={{ ml: 1 }}
            onClick={() => setDeleteId(params.row.id)}
          >
            Delete
          </Button>

        </>
      )
    }
  ];

  return (

    <Box sx={{ display: "flex" }}>

      {/* Sidebar */}

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          "& .MuiDrawer-paper": { width: drawerWidth }
        }}
      >

        <Toolbar />

        <List>

          <ListItem button>
            <ListItemText primary="Dashboard" />
          </ListItem>

          <ListItem button>
            <ListItemText primary="Users" />
          </ListItem>

        </List>

      </Drawer>

      {/* Main */}

      <Box sx={{ flexGrow: 1 }}>

        {/* Topbar */}

        <AppBar position="static">

          <Toolbar>

            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Admin Dashboard
            </Typography>

            <Button color="inherit" onClick={logout}>
              Logout
            </Button>

          </Toolbar>

        </AppBar>

        {/* Content */}

        <Box sx={{ p: 4 }}>

          <Typography variant="h5" sx={{ mb: 3 }}>
            User Management
          </Typography>

          <div style={{ height: 500, width: "100%" }}>

            <DataGrid
              rows={users}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
            />

          </div>

        </Box>

      </Box>

      {/* Delete Dialog */}

      <Dialog open={!!deleteId}>

        <DialogTitle>Delete this user?</DialogTitle>

        <DialogActions>

          <Button onClick={() => setDeleteId(null)}>
            Cancel
          </Button>

          <Button color="error" onClick={confirmDelete}>
            Delete
          </Button>

        </DialogActions>

      </Dialog>

      {/* Change Role Dialog */}

      <Dialog open={!!roleUserId}>

        <DialogTitle>Change Role</DialogTitle>

        <Box sx={{ p: 3 }}>

          <TextField
            label="Role (admin/user)"
            fullWidth
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />

        </Box>

        <DialogActions>

          <Button onClick={() => setRoleUserId(null)}>
            Cancel
          </Button>

          <Button onClick={confirmChangeRole}>
            Update
          </Button>

        </DialogActions>

      </Dialog>

    </Box>

  );
}