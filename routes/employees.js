const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");

router.get("/", auth, () => {
  console.log("get all employees");
});

router.get("/:id", auth, () => {
  console.log("get one employee");
});

router.post("/add", auth, () => {
  console.log("add employee");
});

router.post("/remove/:id", auth, () => {
  console.log("remove employee");
});

router.put("/edit/:id", auth, () => {
  console.log("edit employee");
});

module.exports = {
  router,
};
