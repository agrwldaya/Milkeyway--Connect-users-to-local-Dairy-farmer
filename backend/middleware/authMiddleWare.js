import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.token;
    const cookieToken = req.cookies?.token; // support httpOnly cookie token

    if (!authHeader && !cookieToken) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

    const token = authHeader
      ? (authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader)
      : cookieToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token not found in request header",
      });
    }

     
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      user_id: decoded.id,
      role: decoded.role, // useful to verify admin/farmer later
      email: decoded.email,
    };

    next();
  } catch (error) {
    console.error("JWT Auth Error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied — Admins only",
    });
  }
  next();
};

export const verifyFarmer = (req, res, next) => {
  if (req.user.role !== "farmer") {
    return res.status(403).json({
      success: false,
      message: "Access denied — Farmers only",
    });
  }
  next();
};

export const verifyConsumer = (req, res, next) => {
  if (req.user.role !== "consumer") {
    return res.status(403).json({
      success: false,
      message: "Access denied — Consumers only",
    });
  }
  next();
};

export const verifyFarmerOrConsumer = (req, res, next) => {
  if (req.user.role !== "farmer" && req.user.role !== "consumer") {
    return res.status(403).json({
      success: false,
      message: "Access denied — Farmers or Consumers only",
    });
  }
  next();
};

