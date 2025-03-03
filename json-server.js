const jsonServer = require('json-server');
const server = jsonServer.create();
const path = require('path');
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const fs = require('fs');

// Set default middlewares
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Simple authentication without JWT for now
server.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Get users from db.json
  const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
  const users = db.users || [];
  
  // Find user by email (simplified - no password hashing yet)
  const user = users.find(user => user.email === email);
  
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Remove password from response
  const { password: _, ...userWithoutPassword } = user;
  
  // Return user data with a dummy token
  res.status(200).json({
    user: userWithoutPassword,
    token: 'dummy-jwt-token'
  });
});

server.post('/register', (req, res) => {
  const { email, password, name, businessName } = req.body;
  
  // Read the current database
  const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
  const users = db.users || [];
  
  // Check if user already exists
  if (users.find(user => user.email === email)) {
    return res.status(400).json({ error: 'Email already in use' });
  }
  
  // Create business ID
  const businessId = Date.now().toString();
  
  // Create new user (no password hashing for simplicity)
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password, // Plain text for now - we'll improve this later
    role: 'admin',
    businessId,
    businessName,
    isVerified: false
  };
  
  // Add to users array
  db.users = [...users, newUser];
  
  // Create new business
  const businesses = db.businesses || [];
  const newBusiness = {
    id: businessId,
    name: businessName,
    ownerId: newUser.id,
    email
  };
  db.businesses = [...businesses, newBusiness];
  
  // Write back to db.json
  fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
  
  // Remove password from response
  const { password: _, ...userWithoutPassword } = newUser;
  
  res.status(201).json({
    user: userWithoutPassword,
    token: 'dummy-jwt-token'
  });
});

// Use default router
server.use(router);

// Start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
});