require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

// Sobe DB e servidor
(async () => {
  await connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 API ouvindo em :${PORT}`));
})();
