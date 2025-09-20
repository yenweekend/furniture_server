// index.js
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware để parse JSON
app.use(express.json());

// Route cơ bản
app.get("/", (req, res) => {
  res.send("Hello Express!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
