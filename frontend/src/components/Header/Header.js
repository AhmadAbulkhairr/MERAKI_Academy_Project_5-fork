import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setLogout } from '../../redux/auth';
import TemporaryDrawer from "../../pages/Admin/SideBar";
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import LocalDiningIcon from '@mui/icons-material/LocalDining'; 

import './header.css'

const Header = () => {
  const token = useSelector((state) => state.auth.token);
  const role = useSelector((state) => state.auth.role);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(setLogout());
    navigate('/');
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#4caf50', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', padding: '0 40px', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton component={Link} to="/" sx={{ color: 'white', marginRight: 2 }}>
            <RestaurantIcon sx={{ fontSize: 40 }} />
          </IconButton>
          <Typography variant="h6" className="feedme-logo">
            <Link to="/" className="feedme-link">
              <FastfoodIcon className="feedme-icon" />
              FeedMe
              <LocalDiningIcon className="feedme-icon" />
            </Link>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {!token ? (
            <>
              <Button sx={{ color: 'white', fontWeight: '500', borderRadius: '20px', '&:hover': { backgroundColor: '#388e3c', color: '#ffd700' } }} component={Link} to="/signin">
                Sign In
              </Button>
              <Button sx={{ color: 'white', fontWeight: '500', borderRadius: '20px', '&:hover': { backgroundColor: '#388e3c', color: '#ffd700' } }} component={Link} to="/signup">
                Sign Up
              </Button>
              <Button sx={{ color: 'white', fontWeight: '500', borderRadius: '20px', '&:hover': { backgroundColor: '#388e3c', color: '#ffd700' } }} component={Link} to="/become-partner">
                Become a Partner
              </Button>
              <Button sx={{ color: 'white', fontWeight: '500', borderRadius: '20px', '&:hover': { backgroundColor: '#388e3c', color: '#ffd700' } }} component={Link} to="/become-rider">
                Become a Rider
              </Button>
            </>
          ) : (
            <>
              {role === 'Admin' && (
                <TemporaryDrawer />
              )}
              {role === 'Restaurant Owner' && (
                <Button sx={{ color: 'white', fontWeight: '500', borderRadius: '20px', '&:hover': { backgroundColor: '#388e3c', color: '#ffd700' } }} component={Link} to="/restaurant_owner">
                  My Restaurant
                </Button>
              )}
              {role === 'Customer' && (
                <>
                  <Button sx={{ color: 'white', fontWeight: '500', borderRadius: '20px', '&:hover': { backgroundColor: '#388e3c', color: '#ffd700' } }} component={Link} to="/userOrders">
                    My Orders
                  </Button>
                  <Button sx={{ color: 'white', fontWeight: '500', borderRadius: '20px', '&:hover': { backgroundColor: '#388e3c', color: '#ffd700' } }} component={Link} to="/profile_user">
                    Profile
                  </Button>
                </>
              )}
              {role === 'Rider' && (
                <>
                  <Button sx={{ color: 'white', fontWeight: '500', borderRadius: '20px', '&:hover': { backgroundColor: '#388e3c', color: '#ffd700' } }} component={Link} to="/rider/Profile">
                    Profile
                  </Button>
                  <Button sx={{ color: 'white', fontWeight: '500', borderRadius: '20px', '&:hover': { backgroundColor: '#388e3c', color: '#ffd700' } }} component={Link} to="/rider/All_complete_order">
                    Complete Orders
                  </Button>
                  <Button sx={{ color: 'white', fontWeight: '500', borderRadius: '20px', '&:hover': { backgroundColor: '#388e3c', color: '#ffd700' } }} component={Link} to="/rider/All_delivered_order">
                    Delivered Orders
                  </Button>
                  <Button sx={{ color: 'white', fontWeight: '500', borderRadius: '20px', '&:hover': { backgroundColor: '#388e3c', color: '#ffd700' } }} component={Link} to="/rider/All__order_on_way">
                    Orders On Way
                  </Button>
                  <Button sx={{ color: 'white', fontWeight: '500', borderRadius: '20px', '&:hover': { backgroundColor: '#388e3c', color: '#ffd700' } }} component={Link} to="/rider">
                    Ready Orders
                  </Button>
                </>
              )}
              <Button sx={{ color: 'white', fontWeight: '500', borderRadius: '20px', '&:hover': { backgroundColor: '#388e3c', color: '#ffd700' } }} onClick={handleLogout}>
                Sign Out
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
