import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Forbidden: Role '${req.user?.role}' not allowed` });
    }
    next();
  };
};


// import jwt from 'jsonwebtoken';

// export const protect = (req, res, next) => {
//   const token = req.headers.authorization?.split(' ')[1];

//   if (!token) return res.status(401).json({ message: 'No token provided' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     console.log('Decoded token:', decoded); // Debug output: should include id and role

//     req.user = decoded; // Attach decoded token payload to req.user
//     next();
//   } catch (err) {
//     console.error('JWT verification failed:', err);
//     return res.status(401).json({ message: 'Invalid token' });
//   }
// };

// export const authorizeRoles = (...roles) => {
//   return (req, res, next) => {
//     console.log('User role:', req.user?.role);
//     console.log('Allowed roles:', roles);
//     if (!req.user || !roles.includes(req.user.role)) {
//       return res
//         .status(403)
//         .json({ message: `Forbidden: Role '${req.user?.role}' not allowed` });
//     }
//     next();
//   };
// };
