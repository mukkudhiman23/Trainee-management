const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const moment = require("moment");
const {
  postLeave,
  getLeaveRecords,
  deleteLeave,
  updateLeaveRecord,
} = require("../Controllers/leave");

router.get("/", (req, res) => {
  res.render("leave", { error: "", errors: {} });
});

//route for insertion
router.post(
  "/",
  [
    check("start_date")
      .not()
      .isEmpty()
      .withMessage("Start date is required")
      .custom((value) => {
        if (!moment(value, "MM/DD/YYYY HH:mm A", true).isValid()) {
          throw new Error("date format is invalid");
        }
        return true;
      }),

    check("end_date")
      .not()
      .isEmpty()
      .withMessage("End date is required")
      .custom((value) => {
        console.log(value);
        if (!moment(value, "MM/DD/YYYY HH:mm A", true).isValid()) {
          throw new Error("date format is invalid");
        }
        return true;
      }),

    check("subject")
      .not()
      .isEmpty()
      .withMessage("Subject is required")
      .isLength({ min: 3 })
      .withMessage("Subject length should be required"),
    check("reason")
      .not()
      .isEmpty()
      .withMessage("Leave reason is required")
      .isLength({ min: 10 })
      .withMessage("Reason length should be required"),
  ],
  (req, res, next) => {
    const result = validationResult(req);
    var errors = {};

    for (let error of result.array()) {
      if (!errors.hasOwnProperty(error.param)) {
        errors[error.param] = error.msg;
      }
    }

    if (!result.isEmpty()) {
      res.render("leave", {
        error: "",
        errors: errors,
      });
    } else {
      postLeave(req.body)
        .then((data) => {
          if (data.status != 200) {
            res.render("leave", { error: data.data.msg, errors: {} });
          } else {
            res.redirect("/leave");
          }
        })
        .catch((err) => {
          console.log(err.message);
          res.status(400).json({});
        });
    }
  }
);

//route for listing
router.get("/:id", getLeaveRecords);

//route for updation
router.get("/:id/:trainee_id", (req, res, next) => {
  updateLeaveRecord(req.params, req.body)
    .then((data) => {
      res.status(data.status).json(data.data);
    })
    .catch((err) => {
      res.status(err.status).json(err.data);
    });
});
//route for deletion
router.delete("/:id/:trainee_id", deleteLeave);

module.exports = router;