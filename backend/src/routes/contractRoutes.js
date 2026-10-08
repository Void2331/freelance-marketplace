const express = require("express");

const protect = require("../middleware/authMiddleware.js");
const authorize = require("../middleware/roleMiddleware.js");

const {
  getMyContracts,
  getMyContract,
} = require("../controllers/contractController.js");

const router = express.Router();

router.get(
  "/",
  protect,
  authorize("FREELANCER"),
  getMyContracts
);

router.get(
  "/:id",
  protect,
  authorize("FREELANCER"),
  getMyContract
);

module.exports = router;