require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const OAuth2Strategy = require("passport-google-oauth2").Strategy;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

// Models
const User = require("./models/User");
const Cart = require("./models/Cart");
const Order = require("./models/Order");
const Product = require("./models/Product");
const User1 = require("./models/google");
const OTP = require("./models/OTP");
const Wishlist = require("./models/Wishlist");


const app = express();
const PORT = process.env.PORT || 4500;
const SECRET_KEY = process.env.SECRET_KEY || "your_secret_key";

const clientid = "31050376942-66etnpqo1erq3r8tk7d3kgf79m9n2r88.apps.googleusercontent.com"
const clientsecret = "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"

// ==================== MIDDLEWARE ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: ["http://localhost:4700"], credentials: true }));

app.use(session({
  secret: "15672983hakdhfjkdsd",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 7*24*60*60*1000, httpOnly: true, secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

// ==================== GOOGLE OAUTH STRATEGY ====================
passport.use(new OAuth2Strategy({
  clientID: clientid,
  clientSecret: clientsecret,
  callbackURL: "/auth/google/callback",
  scope: ["profile","email"]
}, async (request, accessToken, refreshToken, profile, done) => {
  try {
    let user = await User1.findOne({ googleId: profile.id });
    if (!user) {
      user = new User1({
        googleId: profile.id,
        username: profile.displayName,
        email: profile.emails[0].value,
        image: profile.photos[0].value,
        country_code: "+91",
        phone: null,
        gender: null,
        dob: null,
        address: null
      });
      await user.save();
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// ==================== GOOGLE AUTH ROUTES ====================
app.get("/auth/google", passport.authenticate("google", { scope: ["profile","email"], accessType: "offline", prompt: "login" }));
app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "http://localhost:4700/login" }), (req, res) => {
  // Generate JWT token for the authenticated user
  const token = jwt.sign({ id: req.user._id, email: req.user.email }, SECRET_KEY, { expiresIn: "1d" });
  
  const isProfileComplete = req.user.phone && req.user.gender && req.user.dob && req.user.address;
  const redirectPage = isProfileComplete ? "home" : "profile";
  
  // Render a page that sends token via postMessage and closes the popup
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Google Login</title>
      </head>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage({
              token: '${token}',
              username: '${req.user.username}',
              redirectPage: '${redirectPage}'
            }, 'http://localhost:4700');
            window.close();
          } else {
            window.location.href = 'http://localhost:4700/${redirectPage}?token=${token}&username=${req.user.username}';
          }
        </script>
        <p>Closing window...</p>
      </body>
    </html>
  `);
});


// Connect MongoDB
mongoose.connect("mongodb+srv://vaghelasahil1402_db_user:parth@cluster0.ht5lfrp.mongodb.net/StarbucksDB")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error", err));

// Generate Unique 4 Digit Order ID
async function generateOrderId() {
  const year = new Date().getFullYear(); // Example: 2025

  const lastOrder = await Order.findOne({})
    .sort({ createdAt: -1 }) // લાસ્ટ ઓર્ડર લાવવો
    .limit(1);

  let nextSerial = 1; // First order

  if (lastOrder && lastOrder.orderId) {
    const lastId = parseInt(lastOrder.orderId);
    const lastYear = Math.floor(lastId / 1000); // Extract year from ID
    const lastSerial = lastId % 1000;

    if (lastYear === year) {
      nextSerial = lastSerial + 1;
    }
  }

  const paddedSerial = nextSerial.toString().padStart(3, "0"); // Example: "001"
  return `${year}${paddedSerial}`; // Example: "2025001"
}
// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token required" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};
app.get("/user/profile1", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ email: user.email, phone: user.phone });
  } catch (err) {
    res.status(500).json({ message: "Error getting profile" });
  }
});

app.get("/user/profile", authenticateToken, async (req, res) => {
  try {
    let user = await User1.findById(req.user.id);
    if (!user) {
      user = await User.findById(req.user.id);
    }
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error getting profile" });
  }
});

app.put("/user/profile", authenticateToken, async (req, res) => {
  try {
    const { username, phone, gender, dob, address } = req.body;
    
    let user = await User1.findById(req.user.id);
    
    if (!user) {
      user = await User.findById(req.user.id);
    }
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username) user.username = username;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;
    if (dob) user.dob = dob;
    if (address) user.address = address;

    await user.save();
    
    res.json({ success: true, message: "Profile updated successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
});
// Email configuration with error handling
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "vaghelaparth2005@gmail.com",
    pass:"pgjmkspktaeyxirp"
  }
});

// Test email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.log('Email configuration error:', error.message);
  } else {
    console.log('Email service ready');
  }
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Step 1: Verify email and send OTP
app.post("/verify-email-send-otp", async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ success: false, message: "Email not found" });
    }

    await OTP.deleteMany({ email: email.toLowerCase() });
    const otp = generateOTP();
    await OTP.create({ email: email.toLowerCase(), otp });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - Starbucks',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #00704A; text-align: center;">Starbucks Password Reset</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="margin: 0 0 15px 0;">Your verification code is:</p>
            <div style="background: #00704A; color: white; padding: 15px; border-radius: 6px; font-size: 24px; font-weight: bold; display: inline-block;">
              ${otp}
            </div>
          </div>
          <p style="color: #666; font-size: 14px;">This code expires in 5 minutes. Don't share it with anyone.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    console.error('OTP Error:', err.message);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

// Step 2: Verify OTP
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  
  try {
    const otpRecord = await OTP.findOne({ 
      email: email.toLowerCase(), 
      otp 
    });

    if (!otpRecord) {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });
    
    res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "OTP verification failed" });
  }
});

// Step 3: Change password after OTP verification
app.post("/change-password-otp", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (newPassword.length < 8) {
      return res.json({ success: false, message: "Password must be at least 8 characters" });
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error updating password" });
  }
});

// Verify Email Exists (legacy - keeping for compatibility)
app.post("/verify-email", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (user) {
    return res.json({ exists: true });
  } else {
    return res.json({ exists: false });
  }
});

app.post("/change-password", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({ message: "User not found" });
    }

    // ✅ Check password length minimum 8
    if (newPassword.length < 8) {
      return res.json({ message: "Password must be at least 8 characters" });
    }

    user.password = newPassword; // Optional: Hash it if needed
    await user.save();

    res.json({ message: "Password updated successfully ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating password" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (password.length < 8) {
    return res.json({ message: "Password must be at least 8 characters" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.json({ message: "No user found" });
  }

  // Check if password is hashed (bcrypt) or plain text (legacy)
  let isPasswordValid = false;
  if (user.password.startsWith('$2b$')) {
    // Hashed password - use bcrypt
    isPasswordValid = await bcrypt.compare(password, user.password);
  } else {
    // Plain text password - direct comparison (legacy support)
    isPasswordValid = user.password === password;
  }

  if (!isPasswordValid) {
    return res.json({ message: "Password incorrect" });
  }

  const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, {
    expiresIn: "1d",
  });

  res.json({ message: "Success", token, username: user.username });
});

// Logout: mark user as inactive
app.post('/logout', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.status = 'inactive';
    await user.save();
    
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to logout', error: err.message });
      }
      req.session.destroy((sessionErr) => {
        if (sessionErr) {
          return res.status(500).json({ success: false, message: 'Failed to destroy session', error: sessionErr.message });
        }
        res.json({ success: true });
      });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to logout', error: err.message });
  }
});

app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Password length check
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be maximum 8 characters" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const newUser = await User.create({ ...req.body, email: email.toLowerCase() });
    res.status(200).json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err });
  }
});

// Add to cart
app.post("/add-to-cart", authenticateToken, async (req, res) => {
  const { productId, image, title, price } = req.body;
  const userId = req.user.id;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find((item) => item.productId === productId);

    if (existingItem) {
      return res.status(400).json({ message: "Item already in cart" });
    } else {
      cart.items.push({ productId, image, title, price, quantity: 1 });
    }

    await cart.save();
    res.status(200).json({ message: "Item added to cart" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
});

// ==================== WISHLIST APIs ====================

// Get wishlist for logged-in user
app.get("/wishlist", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.json({ items: [] });
    }
    return res.json({ items: wishlist.items });
  } catch (err) {
    console.error("Error fetching wishlist:", err.message);
    res.status(500).json({ message: "Error fetching wishlist", error: err.message });
  }
});

// Add product to wishlist (no duplicates)
app.post("/wishlist/add", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { productId, image, title, price } = req.body;

  if (!productId || !image || !title || typeof price !== "number") {
    return res.status(400).json({ message: "Invalid wishlist item data" });
  }

  try {
    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
    }

    const existingItem = wishlist.items.find(
      (item) => item.productId === productId
    );

    if (existingItem) {
      return res
        .status(400)
        .json({ message: "Item already in wishlist" });
    }

    wishlist.items.push({ productId, image, title, price });
    await wishlist.save();

    res.status(201).json({ message: "Item added to wishlist" });
  } catch (err) {
    console.error("Error adding to wishlist:", err.message);
    res.status(500).json({ message: "Error adding to wishlist", error: err.message });
  }
});

// Remove product from wishlist
app.delete("/wishlist/remove/:productId", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  try {
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    const initialLength = wishlist.items.length;
    wishlist.items = wishlist.items.filter((item) => item.productId !== productId);

    if (wishlist.items.length === initialLength) {
      return res.status(404).json({ message: "Item not found in wishlist" });
    }

    await wishlist.save();
    res.status(200).json({ message: "Item removed from wishlist" });
  } catch (err) {
    console.error("Error removing from wishlist:", err.message);
    res.status(500).json({ message: "Error removing from wishlist", error: err.message });
  }
});

// Move a wishlist item to cart
app.post("/wishlist/move-to-cart", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "productId is required" });
  }

  try {
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    const item = wishlist.items.find((i) => i.productId === productId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in wishlist" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingCartItem = cart.items.find(
      (cartItem) => cartItem.productId === productId
    );

    if (existingCartItem) {
      // If item already exists in cart, just remove from wishlist
      wishlist.items = wishlist.items.filter(
        (i) => i.productId !== productId
      );
      await wishlist.save();

      return res.status(200).json({
        message: "Item already in cart, removed from wishlist",
      });
    }

    cart.items.push({
      productId: item.productId,
      image: item.image,
      title: item.title,
      price: item.price,
      quantity: 1,
    });

    // Remove from wishlist after adding to cart
    wishlist.items = wishlist.items.filter(
      (i) => i.productId !== productId
    );

    await Promise.all([cart.save(), wishlist.save()]);

    res.status(200).json({ message: "Item moved to cart" });
  } catch (err) {
    console.error("Error moving wishlist item to cart:", err.message);
    res.status(500).json({
      message: "Error moving wishlist item to cart",
      error: err.message,
    });
  }
});

// Get cart
app.get("/cart", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.json({ cart: [] });

    const fullCart = cart.items.map(item => ({
      ...item._doc,
      total: item.price * item.quantity
    }));

    res.json({ cart: fullCart });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err.message });
  }
});app.put("/update-quantity/:productId", authenticateToken, async (req, res) => {
  const { productId } = req.params;
  const { action } = req.body;
  const userId = req.user.id;

  try {
    const cart = await Cart.findOne({ userId });
    const item = cart.items.find((item) => item.productId === productId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (action === "increase") item.quantity += 1;
    if (action === "decrease") item.quantity -= 1;

    if (item.quantity <= 0) {
      cart.items = cart.items.filter((i) => i.productId !== productId);
    }

    await cart.save();
    res.status(200).json({ message: "Quantity updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove from cart
app.delete("/remove-from-cart/:productId", authenticateToken, async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    const cart = await Cart.findOne({ userId });
    cart.items = cart.items.filter((item) => item.productId !== productId);
    await cart.save();
    res.status(200).json({ message: "Item removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Place Order API
app.post("/order", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { email, phone, address, paymentMethod, cardNumber, expiry, transactionId, paymentStatus } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let user = await User1.findById(userId);
    if (!user) {
      user = await User.findById(userId);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newOrderId = await generateOrderId(); // Call unique ID function

    const order = new Order({
      orderId: newOrderId,
      username: user.username,
      email,
      phone,
      address,
      paymentMethod,
      paymentStatus: paymentStatus || (paymentMethod === "Cash On Delivery" ? "Pending" : "Paid"),
      transactionId: transactionId || null,
      payment_details: {
        cardNumber: (paymentMethod === "Online Payment" && cardNumber) ? cardNumber : null,
        expiry: (paymentMethod === "Online Payment" && expiry) ? expiry : null,
      },
      items: cart.items,
    });

    await order.save();
    await Cart.findOneAndUpdate({ userId }, { items: [] });

    // Get total amount (calculated by pre-save hook)
    const totalAmount = order.total || order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Send order confirmation email
    try {
      // Format order items as a list
      const orderItemsList = order.items.map(item => 
        `• ${item.title} (Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}`
      ).join('<br>');

      // Format order date
      const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });

      const customerName = order.username || 'Valued Customer';
      const storeName = 'Starbucks';
      const supportEmail = 'vaghelaparth2005@gmail.com';

      const mailOptions = {
        from: "vaghelaparth2005@gmail.com",
        to: email,
        subject: "🛒 Order Confirmed – Thank You for Your Purchase!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px;">
            
            <p style="font-size: 16px; color: #333; margin-bottom: 15px;">
              Dear <strong>${user.username}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 25px;">
              Thank you for shopping with <strong>Starbucks</strong>! 🎉<br>
              We’re happy to let you know that your order has been <strong>successfully placed</strong>.
            </p>
            
            <h2 style="color: #333; margin: 20px 0 15px 0; font-size: 18px; text-align:center;">
              📦 <strong>Order Details</strong>
            </h2>
            
            <div style=" color: #888; font-size: 14px; letter-spacing: 2px; text-align: center;">
              ━━━━━━━━━━━━━━━━━━━━
            </div>
            
            <p style="margin: 12px 0; font-size: 15px; color: #333;">
              <strong>Order ID:</strong> ${newOrderId}
            </p>
            <p style="margin: 12px 0; font-size: 15px; color: #333;">
              <strong>Order Date:</strong> ${orderDate}
            </p>
            <p style="margin: 12px 0; font-size: 15px; color: #333;">
              <strong>Payment Method:</strong> ${paymentMethod}
            </p>
            
            <p style="margin: 20px 0 10px 0; font-size: 16px; color: #333;">
              🛍 <strong>Items Ordered:</strong>
            </p>
            <div style="margin: 10px 0 20px 0; padding-left: 10px; border-left: 3px solid #00704A;">
              ${orderItemsList}
            </div>
            
            <p style="margin: 15px 0; font-size: 18px; color: #00704A; font-weight: bold;">
              💰 <strong>Total Amount:</strong> ₹${totalAmount.toFixed(2)}
            </p>
            
              <h2 style="color: #333; margin: 20px 0 15px 0; font-size: 18px; text-align:center;">
              🚚 <strong>Delivery Address</strong>
            </h2>
            
            <div style="color: #888; font-size: 14px; letter-spacing: 2px; text-align: center;">
              ━━━━━━━━━━━━━━━━━━━━
            </div>

            <p style="font-size: 15px; color: #555; white-space: pre-line; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
              ${address}
            </p>
            
            <p style="font-size: 15px; color: #333; line-height: 1.6; margin: 25px 0 15px 0;">
              Your order is now being processed, and we’ll notify you once it has been shipped.
            </p>
            
            <p style="font-size: 15px; color: #333; line-height: 1.6; margin: 15px 0 20px 0;">
              If you have any questions, feel free to contact us at <strong>vaghelaparth2005@gmail.com</strong>.
            </p>
            
            <p style="font-size: 16px; color: #333; margin-top: 25px;">
              Thank you for choosing <strong>Starbucks</strong>.<br>
              We look forward to serving you again! 😊
            </p>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError.message);
      // Don't fail the order if email fails
    }

    res.status(200).json({ message: "Order placed", orderId: newOrderId, transactionId: transactionId || null });
  } catch (err) {
    res.status(500).json({ message: "Order error", error: err.message });
  }
});

// Fetch orders
app.get("/orders", authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ email: req.user.email }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Cancel order
app.put("/api/cancel-order/:orderId", authenticateToken, async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.email !== req.user.email) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({ message: "Order already cancelled" });
    }

    order.status = "Cancelled";
    order.cancelReason = reason;
    order.items.forEach(item => item.status = "Cancelled");

    await order.save();
    res.status(200).json({ message: "Order cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: "Cancel error", error: err.message });
  }
});

// Admin credentials (for demo; use env vars/db in production)
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';

// Admin login endpoint
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ admin: true, username }, SECRET_KEY, { expiresIn: '1d' });
    return res.json({ success: true, token });
  }
  res.json({ success: false, message: 'Invalid admin credentials' });
});

// Admin authentication middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Admin token required' });
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err || !user.admin) return res.status(403).json({ message: 'Invalid admin token' });
    req.admin = user;
    next();
  });
};

// Admin: Get all users
app.get("/admin/users", authenticateAdmin, async (req, res) => {
  try {
    const [regularUsers, googleUsers] = await Promise.all([
      User.find({}).lean(),
      User1.find({}).lean()
    ]);

    const allUsers = [
      ...regularUsers.map(u => ({
        ...u,
        loginMethod: "email"
      })),
      ...googleUsers.map(u => ({
        ...u,
        loginMethod: "google"
      }))
    ];

    const userMap = new Map();
    for (const user of allUsers) {
      const email = user.email?.toLowerCase();
      if (email) {
        if (!userMap.has(email)) {
          userMap.set(email, user);
        } else {
          const existing = userMap.get(email);
          if (user.createdAt && (!existing.createdAt || new Date(user.createdAt) > new Date(existing.createdAt))) {
            userMap.set(email, user);
          }
        }
      } else {
        const id = user._id.toString();
        if (!userMap.has(id)) {
          userMap.set(id, user);
        }
      }
    }

    const uniqueUsers = Array.from(userMap.values()).map(user => ({
      ...user,
      createdAt: user.createdAt || new Date(parseInt(user._id.toString().substring(0, 8), 16) * 1000)
    }));

    uniqueUsers.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });

    res.status(200).json(uniqueUsers);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Admin: Get all orders
app.get("/admin/orders", authenticateAdmin, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Admin dashboard stats endpoint
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const [totalUsers, totalOrders, orders] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Order.find({}).sort({ createdAt: -1 }).limit(5)
    ]);
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    res.json({
      totalUsers,
      totalOrders,
      totalRevenue,
      recentOrders: orders
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: err.message });
  }
});

// Admin: Update order status
app.put('/admin/orders/:orderId/status', authenticateAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['Pending', 'Approved', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided' });
    }
    
    const order = await Order.findByIdAndUpdate(
      orderId, 
      { status, updatedAt: new Date() }, 
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ success: true, message: `Order status updated to ${status}`, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update order status', error: err.message });
  }
});

// Admin: Delete user by ID
app.delete('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    // Optionally, delete related data (orders, carts, etc.)
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete user', error: err.message });
  }
});

// ==================== PRODUCT MANAGEMENT APIs ====================

// Get all products (public)
app.get('/api/products', async (req, res) => {
  try {
    const { category, featured, displayOnGift, displayOnMenu } = req.query;
    let filter = { isAvailable: true };
    
    if (category && category !== 'All') filter.category = category;
    if (featured === 'true') filter.featured = true;
    if (displayOnGift === 'true') filter.displayOnGift = true;
    if (displayOnMenu === 'true') filter.displayOnMenu = true;
    
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
});

// Admin: Get all products (with admin details)
app.get('/admin/products', authenticateAdmin, async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
});

// Admin: Create new product
app.post('/admin/products', authenticateAdmin, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, product, message: 'Product created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create product', error: err.message });
  }
});

// Admin: Update product
app.put('/admin/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, product, message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update product', error: err.message });
  }
});

// Admin: Delete product
app.delete('/admin/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete product', error: err.message });
  }
});

// Admin: Toggle product availability
app.patch('/admin/products/:id/toggle-availability', authenticateAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    product.isAvailable = !product.isAvailable;
    await product.save();
    
    res.json({ 
      success: true, 
      product, 
      message: `Product ${product.isAvailable ? 'activated' : 'deactivated'} successfully` 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle product availability', error: err.message });
  }
});

// Admin: Toggle product display options
app.patch('/admin/products/:id/toggle-display', authenticateAdmin, async (req, res) => {
  try {
    const { displayType } = req.body; // 'gift' or 'menu'
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    if (displayType === 'gift') {
      product.displayOnGift = !product.displayOnGift;
    } else if (displayType === 'menu') {
      product.displayOnMenu = !product.displayOnMenu;
    }
    
    await product.save();
    
    res.json({ 
      success: true, 
      product, 
      message: `Product display on ${displayType} ${product[displayType === 'gift' ? 'displayOnGift' : 'displayOnMenu'] ? 'enabled' : 'disabled'}` 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle product display', error: err.message });
  }
});

// Test Route
app.get("/", (req, res) => {
  res.send("API is running successfully ");
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

