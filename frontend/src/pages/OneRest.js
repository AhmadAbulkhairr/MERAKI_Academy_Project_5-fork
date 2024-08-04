import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Box,
  Button,
  Modal,
  IconButton,
  Badge,
} from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [warningModal, setWarningModal] = useState(false);
  const [loginPromptModal, setLoginPromptModal] = useState(false);
  const [newItem, setNewItem] = useState(null);
  const [cartRestaurantId, setCartRestaurantId] = useState(null);

  useEffect(() => {
    getRestaurantData();
    if (token) getCartData();
  }, [id, token, newItem]);

  const getRestaurantData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/restaurants/allInfo/${id}`
      );
      setRestaurant(response.data.restaurant);
      setLoading(false);
    } catch (err) {
      setError("Failed to get restaurant data.");
      setLoading(false);
    }
  };

  const getCartData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/carts/elements", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(response.data.cart);
      if (response.data.cart.length > 0) {
        setCartRestaurantId(response.data.cart[0].restaurant_id);
      }
    } catch (error) {
      console.error("Error getting cart data", error);
    }
  };

  const addItemToCart = async (item) => {
    if (!token) {
      setLoginPromptModal(true);
      return;
    }

    if (cartRestaurantId && cartRestaurantId != item.restaurant_id) {
      setNewItem(item);
      setWarningModal(true);
    } else {
      await handleAddItem(item);
    }
  };

  const handleAddItem = async (item) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/carts",
        { menu_item_id: item.id, quantity: 1, restaurant_id: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (cartRestaurantId != id) {
        setCartItems([]);
      }
      setCartItems((prevCartItems) => {
        const itemIds = prevCartItems.map((cartItem) => cartItem.menu_item_id);

        if (itemIds.includes(item.id)) {
          return prevCartItems;
        } else {
          return [...prevCartItems, response.data.cart_item];
        }
      });
      setCartRestaurantId(id);
      setWarningModal(false);
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  const handleConfirmReplace = async () => {
    await handleAddItem(newItem);
    setWarningModal(false);
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const item = restaurant.menu_items[result.source.index];
    if (result.destination.droppableId === "cart") {
      addItemToCart(item);
    }
  };

  if (loading) return <CircularProgress />;

  if (error)
    return (
      <Typography variant="h6" color="error">
        {error}
      </Typography>
    );

  return (
    <Container>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" gutterBottom>
          {restaurant.name}
        </Typography>
        {token && (
          <IconButton color="inherit" onClick={() => navigate("/my_cart")}>
            <Badge badgeContent={cartItems.length} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        )}
      </Box>
      <Box sx={{ display: "flex", marginBottom: 2 }}>
        <img
          src={restaurant.image_url}
          alt={restaurant.name}
          style={{
            width: "200px",
            height: "200px",
            borderRadius: "10px",
            marginRight: "20px",
          }}
        />
        <Box>
          <Typography variant="body1">
            <strong>Address:</strong> {restaurant.address}
          </Typography>
          <Typography variant="body1">
            <strong>Category:</strong> {restaurant.category}
          </Typography>
          <Typography variant="body1">
            <strong>Phone:</strong> {restaurant.phone_number}
          </Typography>
          <Typography variant="body1">
            <strong>Delivery Fees:</strong> ${restaurant.delivery_fees}
          </Typography>
          <Typography variant="body1">
            <strong>Rating:</strong> {restaurant.average_rating} (based on{" "}
            {restaurant.rating_count} reviews)
          </Typography>
        </Box>
      </Box>
      <Typography variant="h5" gutterBottom>
        Menu
      </Typography>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="menuItems">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {Object.keys(restaurant.menu_items).map((category, categoryIndex) => (
                <Box key={category} sx={{ marginBottom: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    {category}
                  </Typography>
                  <Grid container spacing={2}>
                    {restaurant.menu_items[category].map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <Card
                              sx={{
                                minWidth: 300,
                                borderRadius: 2,
                                boxShadow: 3,
                                transition: "transform 0.3s",
                                "&:hover": { transform: "scale(1.05)" },
                              }}
                            >
                              <CardMedia
                                component="img"
                                height="140"
                                image={item.image_url || "default_image_url.jpg"}
                                alt={item.name}
                              />
                              <CardContent>
                                <Typography
                                  gutterBottom
                                  variant="h6"
                                  component="div"
                                >
                                  {item.name}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  {item.description}
                                </Typography>
                                <Typography variant="body1" color="textPrimary">
                                  ${item.price}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color={item.available ? "green" : "red"}
                                >
                                  {item.available
                                    ? "Available"
                                    : "Not Available"}
                                </Typography>
                                {item.available && (
                                  <IconButton
                                    color="primary"
                                    onClick={() => addItemToCart(item)}
                                  >
                                    <AddShoppingCartIcon />
                                  </IconButton>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        )}
                      </Draggable>
                    ))}
                  </Grid>
                </Box>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        <Droppable droppableId="cart">
          {(provided) => (
            <Box
              {...provided.droppableProps}
              ref={provided.innerRef}
              sx={{
                border: "2px dashed #ccc",
                padding: 2,
                marginTop: 4,
                textAlign: "center",
              }}
            >
              <Typography variant="h6">Drop Here to Add to Cart</Typography>
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>

      <Modal open={warningModal} onClose={() => setWarningModal(false)}>
        <Box
          sx={{
            padding: 2,
            backgroundColor: "white",
            borderRadius: 2,
            margin: "auto",
            width: 400,
            mt: 10,
          }}
        >
          <Typography>
            Adding this item will replace the current items in your cart from a
            different restaurant. Do you want to proceed?
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 2,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmReplace}
            >
              Yes
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setWarningModal(false)}
            >
              No
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={loginPromptModal} onClose={() => setLoginPromptModal(false)}>
        <Box
          sx={{
            padding: 2,
            backgroundColor: "white",
            borderRadius: 2,
            margin: "auto",
            width: 400,
            mt: 10,
          }}
        >
          <Typography>
            You need to be logged in to add items to the cart. Please log in to
            continue.
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 2,
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/signin")}
            >
              Sign In
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setLoginPromptModal(false)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default RestaurantDetails;
