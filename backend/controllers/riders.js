const { pool } = require("../models/db");

const updateRider = async (req, res) => {
  const { id } = req.params;
  const { vehicle_details } = req.body;
  try {
    const query =
      "UPDATE riders SET vehicle_details = COALESCE($1,vehicle_details) WHERE id = $2 RETURNING *";
    const result = await pool.query(query, [vehicle_details, id]);
    if (result.rowCount === 0) {
      return res.status(200).json({
        success: false,
        message: "Erorr Update",
      });
    }
    res.status(200).json({
      success: true,
      message: "updated successfully",
      result: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
//for admin
const findAllRiders = async (req, res) => {
  try {
    const query =
      "SELECT * FROM riders INNER JOIN users ON riders.user_id = users.id WHERE riders.deleted_at ='0'";
    const result = await pool.query(query);

    if (result.rows.length === 0)
      return res.status(200).json({
        success: false,
        message: "Not Found",
      });

    res.status(200).json({
      success: true,
      result: result.rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
//for admin
const findRiderById = async (req, res) => {
  const { id } = req.params;
  try {
    const query =
      "SELECT * FROM riders INNER JOIN users ON riders.user_id = users.id WHERE riders.id = $1";
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0)
      return res.status(200).json({
        success: false,
        message: "Not Found",
      });

    res.status(200).json({
      success: true,
      result: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
//admin i guess

const getRidersByUserId = async (req, res) => {
  const { id } = req.params;
  try {
    const query =
      "SELECT * FROM riders INNER JOIN users ON riders.user_id = users.id WHERE riders.user_id = $1";
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0)
      return res.status(200).json({
        success: false,
        message: "Not Found",
      });

    res.status(200).json({
      success: true,
      result: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
//not pending "ready to pick up" mn el restuarnt 
//for rider first step take orders from res
const getAllOrderIsPending = async (req, res) => {
  try {
    const query =
      "SELECT * FROM orders WHERE status='ready to pick up' AND deleted_at = '0'";
    const result = await pool.query(query);

    if (result.rows.length === 0)
      return res.status(404).json({
        success: false,
        message: "Not Found",
      });

    res.status(200).json({
      success: true,
      result: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
//momtaz 
const updateStatusOrder = async (req, res) => {
  const { id_rider, id_order, status } = req.body;

  try {
    const query = `UPDATE orders SET status = COALESCE($1,status),
                  rider_id=COALESCE($2,rider_id) WHERE id =$3 RETURNING *`;
    const result = await pool.query(query, [status, id_rider, id_order]);

    if (result.rowCount === 0) {
      return res.status(200).json({
        success: false,
        message: "Error Update",
      });
    }
    const result1 = await pool.query("UPDATE riders SET status ='not available' WHERE user_id = $1" ,[id_rider]) 
    console.log(result1) ; 
    res.status(200).json({
      success: true,
      message: "Successfully update",
      result: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
// good

const deliveryOfTheOrder = async(req , res )=>{
  const {id} = req.params ;  
  try{
  const query = "UPDATE riders SET status ='available' WHERE user_id = $1"
  const result = await pool.query(query, [id]);
  res.status(200).json({
    success: true,
    message: "Successfully update",
    result: result.rows[0],
  });
}catch (err) {
  res.status(500).json({
    success: false,
    message: "Server error",
    error: err.message,
  });
}
}


// manage orders by rider 

const acceptOrder = async (req, res) => {
  const userId = req.token.userId;
  const { orderId } = req.params;

  try {
      // jeeeb riderId using userId
      const riderResult = await pool.query(
          `SELECT rider_id FROM riders WHERE user_id = $1`,
          [userId]
      );

      if (riderResult.rows.length === 0) {
          return res.status(404).json({
              success: false,
              message: 'Rider not found'
          });
      }

      const riderId = riderResult.rows[0].rider_id;

      // Update order status and assign him
      const orderResult = await pool.query(
          `UPDATE orders 
           SET status = 'Accepted by Rider', rider_id = $1, updated_at = CURRENT_TIMESTAMP
           WHERE order_id = $2 AND status = 'ready to pick up'
           RETURNING *`,
          [riderId, orderId]
      );

      if (orderResult.rows.length === 0) {
          return res.status(404).json({
              success: false,
              message: 'Order not found or cannot be accepted'
          });
      }

      res.status(200).json({
          success: true,
          message: 'Order accepted by rider',
          order: orderResult.rows[0]
      });
  } catch (err) {
      res.status(500).json({
          success: false,
          message: 'Server error',
          error: err.stack
      });
  }
};

//step 2 
//on the way 
const setOrderOnTheWay = async (req, res) => {
  const userId = req.token.userId;
  const { orderId } = req.params;

  try {
      const riderResult = await pool.query(
          `SELECT rider_id FROM riders WHERE user_id = $1`,
          [userId]
      );

      if (riderResult.rows.length === 0) {
          return res.status(404).json({
              success: false,
              message: 'Rider not found'
          });
      }

      const riderId = riderResult.rows[0].rider_id;

      // Update order status to "On the Way"
      const orderResult = await pool.query(
          `UPDATE orders 
             SET status = 'On the Way', updated_at = CURRENT_TIMESTAMP
             WHERE order_id = $1 AND rider_id = $2 AND status = 'Accepted by Rider'
             RETURNING *`,
          [orderId, riderId]
      );

      if (orderResult.rows.length === 0) {
          return res.status(404).json({
              success: false,
              message: 'Order not found or cannot be set On the Way'
          });
      }

      res.status(200).json({
          success: true,
          message: 'Order status updated to On the Way',
          order: orderResult.rows[0]
      });
  } catch (err) {
      res.status(500).json({
          success: false,
          message: 'Server error',
          error: err.stack
      });
  }
};

//step 3 


const markOrderAsDelivered = async (req, res) => {
    const userId = req.token.userId;
    const { orderId } = req.params;

    try {
        const riderResult = await pool.query(
            `SELECT rider_id FROM riders WHERE user_id = $1`,
            [userId]
        );

        if (riderResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Rider not found'
            });
        }

        const riderId = riderResult.rows[0].rider_id;

        // Update order status to "Delivered"
        const orderResult = await pool.query(
            `UPDATE orders 
             SET status = 'Delivered', updated_at = CURRENT_TIMESTAMP
             WHERE order_id = $1 AND rider_id = $2 AND status = 'On the Way'
             RETURNING *`,
            [orderId, riderId]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Order not found or cannot be marked as Delivered'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order marked as delivered',
            order: orderResult.rows[0]
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.stack
        });
    }
};

//step four 

const getAllOrderIsDelivered = async (req, res) => {
  const userId = req.token.userId;


  try {
    const riderResult = await pool.query(
      `SELECT rider_id FROM riders WHERE user_id = $1`,
      [userId]
  );

  if (riderResult.rows.length === 0) {
      return res.status(404).json({
          success: false,
          message: 'Rider not found'
      });
  }

  const riderId = riderResult.rows[0].rider_id;
    const query =
      "SELECT * FROM orders WHERE status='Delivered' AND rider_id =$1";
    const result = await pool.query(query,[riderId]);

    if (result.rows.length === 0)
      return res.status(200).json({
        success: false,
        message: "Not Found",
      });

    res.status(200).json({
      success: true,
      result: result.rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

const getAllOrderIsOnTheWay = async (req, res) => {
  const userId = req.token.userId;


  try {
    const riderResult = await pool.query(
      `SELECT rider_id FROM riders WHERE user_id = $1`,
      [userId]
  );

  if (riderResult.rows.length === 0) {
      return res.status(404).json({
          success: false,
          message: 'Rider not found'
      });
  }

  const riderId = riderResult.rows[0].rider_id;
    const query =
      "SELECT * FROM orders WHERE status='on the way' AND rider_id =$1";
    const result = await pool.query(query,[riderId]);

    if (result.rows.length === 0)
      return res.status(200).json({
        success: false,
        message: "Not Found",
      });

    res.status(200).json({
      success: true,
      result: result.rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
  
const getAllOrderIsAccepted = async (req, res) => {
  const userId = req.token.userId;


  try {
    const riderResult = await pool.query(
      `SELECT rider_id FROM riders WHERE user_id = $1`,
      [userId]
  );

  if (riderResult.rows.length === 0) {
      return res.status(404).json({
          success: false,
          message: 'Rider not found'
      });
  }

  const riderId = riderResult.rows[0].rider_id;
    const query =
      "SELECT * FROM orders WHERE status='Accepted by Rider' AND rider_id =$1";
    const result = await pool.query(query,[riderId]);

    if (result.rows.length === 0)
      return res.status(200).json({
        success: false,
        message: "Not Found",
      });

    res.status(200).json({
      success: true,
      result: result.rows,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
}
}
module.exports = {
  updateRider,
  findAllRiders,
  findRiderById,
  getRidersByUserId,
  getAllOrderIsPending,
  updateStatusOrder,
  deliveryOfTheOrder,
  acceptOrder,
  setOrderOnTheWay,
  markOrderAsDelivered,
  getAllOrderIsOnTheWay,
  getAllOrderIsDelivered,
  getAllOrderIsAccepted
};