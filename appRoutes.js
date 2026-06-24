const express = require("express");
const router = express.Router();
const db = require("../db");
const path = require("path");

/* ================= USER FORM ================= */
router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/index.html"));
});

/* ================= SAVE COMPLAINT ================= */
router.post("/submit", (req, res) => {
  const { location, pollution_type, description } = req.body;

  db.query(
    "INSERT INTO complaints (user_id, location, pollution_type, description) VALUES (1, ?, ?, ?)",
    [location, pollution_type, description],
    (err, result) => {
      if (err) {
        res.send("Error submitting complaint");
      } else {
        res.send(`
          <h2>Complaint Submitted Successfully ✅</h2>
          <p>Your Complaint ID is:</p>
          <h3 style="color:blue">${result.insertId}</h3>

          <p>Please save this ID to track your complaint.</p>

          <a href="/track">Track Complaint</a> |
          <a href="/">Go Back</a>
        `);
      }
    }
  );
});


/* ================= ADMIN LOGIN PAGE ================= */
router.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/admin.html"));
});

/* ================= ADMIN LOGIN ================= */
router.post("/admin-login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username=? AND password=?",
    [username, password],
    (err, result) => {
      if (result.length > 0) {
        res.redirect("/dashboard");
      } else {
        res.send("Invalid Login");
      }
    }
  );
});

/* ================= ADMIN DASHBOARD ================= */
router.get("/dashboard", (req, res) => {

  // COUNT TOTAL
  db.query("SELECT COUNT(*) AS total FROM complaints", (e1, totalRes) => {

    // COUNT PENDING
    db.query("SELECT COUNT(*) AS pending FROM complaints WHERE status='Pending'", (e2, pendingRes) => {

      // COUNT IN REVIEW
      db.query("SELECT COUNT(*) AS review FROM complaints WHERE status='In Review'", (e3, reviewRes) => {

        // COUNT RESOLVED
        db.query("SELECT COUNT(*) AS resolved FROM complaints WHERE status='Resolved'", (e4, resolvedRes) => {

          // GET ALL COMPLAINTS
          db.query("SELECT * FROM complaints", (err, rows) => {

            let tableRows = rows.map(c => `
              <tr>
                <td>${c.id}</td>
                <td>${c.location}</td>
                <td>${c.pollution_type}</td>
                <td>${c.description}</td>

                <td class="${
                  c.status === 'Pending'
                    ? 'status-pending'
                    : c.status === 'In Review'
                    ? 'status-review'
                    : 'status-resolved'
                }">
                  ${c.status}
                </td>

                <td>
                  ${
                    c.status !== 'Resolved'
                      ? `
                        <a class="action-review" href="/review/${c.id}">Review</a>
                        <a class="action-resolve" href="/resolve/${c.id}">Resolve</a>
                      `
                      : ''
                  }
                  <a class="action-delete" href="/delete/${c.id}">Delete</a>
                </td>
              </tr>
            `).join("");

            res.send(`
              <link rel="stylesheet" href="/style.css">

              <h2>Admin Dashboard</h2>

              <div class="stats">
                <div class="card">Total<br>${totalRes[0].total}</div>
                <div class="card pending">Pending<br>${pendingRes[0].pending}</div>
                <div class="card review">In Review<br>${reviewRes[0].review}</div>
                <div class="card resolved">Resolved<br>${resolvedRes[0].resolved}</div>
              </div>

              <table>
                <tr>
                  <th>ID</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
                ${tableRows}
              </table>

              <br>
              <a href="/admin">Logout</a>
            `);
          });
        });
      });
    });
  });
});


/* ================= STATUS UPDATE ================= */
router.get("/review/:id", (req, res) => {
  db.query(
    "UPDATE complaints SET status='In Review' WHERE id=?",
    [req.params.id],
    () => res.redirect("/dashboard")
  );
});

router.get("/resolve/:id", (req, res) => {
  db.query(
    "UPDATE complaints SET status='Resolved' WHERE id=?",
    [req.params.id],
    () => res.redirect("/dashboard")
  );
});

/* ================= DELETE ================= */
router.get("/delete/:id", (req, res) => {
  db.query(
    "DELETE FROM complaints WHERE id=?",
    [req.params.id],
    () => res.redirect("/dashboard")
  );
});

module.exports = router;
/*================= TRACK*================*/
router.get("/track", (req, res) => {
  res.send(`
    <link rel="stylesheet" href="/style.css">
    <h2>Track Your Complaint</h2>

    <form method="GET" action="/track-result">
      <input name="id" placeholder="Enter Complaint ID" required>
      <button type="submit">Track</button>
    </form>

    <br>
    <a href="/">Back to Home</a>
  `);
});
/*==================TRACK RESULT LOGIC=============*/
router.get("/track-result", (req, res) => {
  const id = req.query.id;

  db.query(
    "SELECT * FROM complaints WHERE id = ?",
    [id],
    (err, rows) => {
      if (rows.length === 0) {
        res.send(`
          <h3>No complaint found with this ID ❌</h3>
          <a href="/track">Try Again</a>
        `);
      } else {
        const c = rows[0];
        res.send(`
          <link rel="stylesheet" href="/style.css">
          <h2>Complaint Status</h2>

          <p><b>Complaint ID:</b> ${c.id}</p>
          <p><b>Location:</b> ${c.location}</p>
          <p><b>Type:</b> ${c.pollution_type}</p>

          <p><b>Status:</b>
            <span class="${
              c.status === 'Pending'
                ? 'status-pending'
                : c.status === 'In Review'
                ? 'status-review'
                : 'status-resolved'
            }">
              ${c.status}
            </span>
          </p>

          <br>
          <a href="/track">Track Another</a>
        `);
      }
    }
  );
});
