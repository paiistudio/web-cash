const router = require("express").Router();

const controller = require("../controllers/transactionsController");
const validateTransaction = require("../middleware/validateTransaction");

router.get("/", controller.list);
router.post("/", validateTransaction, controller.create);
router.put("/:id", validateTransaction, controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
