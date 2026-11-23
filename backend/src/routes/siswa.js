const router = require("express").Router();

const controller = require("../controllers/siswaController");
const validateSiswa = require("../middleware/validateSiswa");

router.get("/", controller.list);
router.post("/", validateSiswa, controller.create);
router.put("/:id", validateSiswa, controller.update);
router.delete("/:id", controller.remove);

module.exports = router;
