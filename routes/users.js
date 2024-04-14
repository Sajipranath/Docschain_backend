const router = require('express').Router();
const {User, validate} = require('../model/user');
const bcrypt = require('bcrypt');
const config = require('config');
const jwt = require('jsonwebtoken');

// Middleware to authenticate the token
function authMiddleware(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
  
    try {
      //console.log(token);
      const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
      req.user = decoded; // Set the decoded token as req.user
      // console.log(req.user);
      next();
    } catch (ex) {
      return res.status(400).json({ message: 'Invalid token.' });
    }
  }

router.post("/signup", async(req, res) => {
    try {
        const{error} = validate(req.body);
        if(error)
            return res.status(400).send({message: error.details[0].message});
        const user = await User.findOne({email: req.body.email});
        if(user)
            return res.status(409).send({message: 'User with given email already exist'});
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        await User({...req.body, password:hashPassword}).save();
        res.status(201).send({message: "User created successfully"})
    } catch (error) {
        res.status(500).send({message: error})
    }
});


// Example of a protected route that requires authentication
router.get('/username', authMiddleware, async (req, res) => {
  try {
    // Assuming the authenticated user ID is available in req.user
    const userId = req.user._id;

    // console.log(userId)
    const user = await User.findById(userId);
    const firstName=user.firstName;
    
    //  console.log(firstName);

    
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.status(200).send({ name: firstName}); // Assuming the user's name is stored in the 'name' field
  } catch (error) {
    res.status(500).send({ message: error });
  }
});
  

    router.get('/detalies', authMiddleware, async (req, res) => {
      try {
       
        const userId = req.user._id;
         
        const user = await User.findById(userId);
        const userInfo = {
        _id: userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email :user.email,
        batch: user.batch,
        isAdmin: user.isAdmin,
        pic: user.pic,
        
      }
  
  
        
        if (!user) {
          return res.status(404).send({ message: 'User not found' });
        }
         
        console.log("user info--->",userInfo)
      
        res.status(200).send(userInfo); 
      } catch (error) {
        res.status(500).send({ message: error });
      }
    });
  
   //Get or Search all users   GET api/users/allusers?search=s
  router.get('/allusers', authMiddleware, async (req, res) => {
    const keyword = req.query.search
      ? {
          $or: [
            { firstName: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};
  
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.send(users);
  });
  
    //retrieve users by batch number
  router.get('/batch/:batchNumber', async (req, res) => {
      try {
          const batchNumber = req.params.batchNumber;
          const users = await User.find({ batch: batchNumber });
          
          if (!users || users.length === 0) {
              return res.status(404).send({ message: 'No users found for the given batch number' });
          }
          
          const userNames = users.map(user => ({
              firstName: user.firstName,
              email: user.email
          }));
          
          res.status(200).send({ users: userNames });
      } catch (error) {
          res.status(500).send({ message: error });
      }
  });

module.exports = router;