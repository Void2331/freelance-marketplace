const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validateMiddleware");

const {
  getMyProjects,
  getProjectById,
  updateProject,
  cancelProject,
  completeProject,
  getAllProjects
} = require("../controllers/projectController");

const {
  updateProjectSchema
} = require("../validators/projectValidator");

const router = express.Router();


/*
====================================================
ADMIN
====================================================
*/

router.get(
  "/admin/projects",
  protect,
  authorize("ADMIN"),
  getAllProjects
);


/*
====================================================
CLIENT + FREELANCER
====================================================
*/

router.get(
  "/projects",
  protect,
  authorize(
    "ADMIN",
    "CLIENT",
    "FREELANCER"
  ),
  getMyProjects
);


router.get(
  "/projects/:id",
  protect,
  authorize(
    "ADMIN",
    "CLIENT",
    "FREELANCER"
  ),
  getProjectById
);


/*
====================================================
CLIENT ONLY
====================================================
*/

router.patch(
  "/projects/:id",
  protect,
  authorize("CLIENT"),
  validate(updateProjectSchema),
  updateProject
);


router.patch(
  "/projects/:id/cancel",
  protect,
  authorize("CLIENT"),
  cancelProject
);


router.patch(
  "/projects/:id/complete",
  protect,
  authorize("CLIENT"),
  completeProject
);


module.exports = router;