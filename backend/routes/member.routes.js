const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  addMember,
  updateMemberRole,
  removeMember,
  getMembers
} = require("../services/member.service");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware);

router.get("/", getMembers);
router.post("/", addMember);
router.put("/:userId", updateMemberRole);
router.delete("/:userId", removeMember);

module.exports = router;
