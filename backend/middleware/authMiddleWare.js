import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    
    const authHeader = req.headers.authorization || req.headers.token;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

   
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

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

