const express = require("express");
const app = express();

const appRoutes = require("./routes/appRoutes");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use("/", appRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
