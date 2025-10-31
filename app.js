const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(express.json());

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb+srv://<your_mongodb_uri_here>", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("DB Connection Error:", err));

// ✅ User Schema
const userSchema = new mongoose.Schema({
  name: String,
  balance: Number,
});

const User = mongoose.model("User", userSchema);

// ✅ Create users (for testing)
app.post("/create-users", async (req, res) => {
  try {
    const users = await User.insertMany([
      { name: "Alice", balance: 1000 },
      { name: "Bob", balance: 500 },
    ]);
    res.status(201).json({ message: "Users created", users });
  } catch (error) {
    res.status(500).json({ message: "Error creating users", error: error.message });
  }
});

// ✅ Transfer API
app.post("/transfer", async (req, res) => {
  const { fromUserId, toUserId, amount } = req.body;

  try {
    // Fetch both users
    const sender = await User.findById(fromUserId);
    const receiver = await User.findById(toUserId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    if (sender.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Sequential updates (no transactions)
    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    res.status(200).json({
      message: `Transferred $${amount} from ${sender.name} to ${receiver.name}`,
      senderBalance: sender.balance,
      receiverBalance: receiver.balance,
    });
  } catch (error) {
    res.status(500).json({ message: "Transfer failed", error: error.message });
  }
});

// ✅ Default route
app.get("/", (req, res) => {
  res.send("Account Transfer System is running 🚀");
});

// ✅ Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${3000}`));
