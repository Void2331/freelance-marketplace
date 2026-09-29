const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validateMiddleware");

const {
  createProposal,
  getJobProposals,
  getMyProposals,
  getProposalById,
  acceptProposal,
  rejectProposal,
  getClientProposals
} = require("../controllers/proposalController");

const {
  createProposalSchema
} = require("../validators/proposalValidator");

const router = express.Router();


/*
====================================================
FREELANCER ROUTES
====================================================
*/

router.post(
  "/jobs/:jobId/proposals",
  protect,
  authorize("FREELANCER"),
  validate(createProposalSchema),
  createProposal
);

router.get(
  "/proposals/my",
  protect,
  authorize("FREELANCER"),
  getMyProposals
);


/*
====================================================
CLIENT ROUTES
====================================================
*/

router.get(
  "/jobs/:jobId/proposals",
  protect,
  authorize("CLIENT"),
  getJobProposals
);

router.patch(
  "/proposals/:id/accept",
  protect,
  authorize("CLIENT"),
  acceptProposal
);

router.patch(
  "/proposals/:id/reject",
  protect,
  authorize("CLIENT"),
  rejectProposal
);

router.get(
  "/proposals/client",
  protect,
  authorize("CLIENT"),
  getClientProposals
);

/*

SHARED ROUTE

*/

router.get(
  "/proposals/:id",
  protect,
  authorize("CLIENT", "FREELANCER"),
  getProposalById
);


module.exports = router;