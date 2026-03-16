const bcrypt = require('bcrypt');
const prisma = require('../config/db');
const generateToken = require('../utils/generateToken');

const register = async (req, res) => {
  try{  
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required',
      });
    }
  // first we will check if the user already exists with the given email
  const existingUser = await prisma.user.findUnique({
    where: { email: email },
  });

 if (existingUser) {
  return res.status(400).json({message: 'User already exists with this email', });
}

  // now hashing the password 
  const hashedPassword = await bcrypt.hash(password, 10);

  // now we will create the user in the database
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });
   // once registered we will generate a token and user will be automcatically logged in
   const token = generateToken(user.id);
   return res.status(201).json({
      token,
      user: {
        id: user.id,
        name : user.name,
        email: user.email,
      },
    });
} 
catch (error) {
  console.error(error); 
    return res.status(500).json({
      message: 'Server error',
    });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    // finding the user with the given email
  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
  return res.status(401).json({
    message: 'Invalid email or password',
  });
}

  // checking correctness of the password
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({
      message: 'Invalid email or password',
    });
  }

  // to maintain consistency with the register , here also we will generate a token and return the user info
  const token = generateToken(user.id);
   return res.status(200).json({
      token,
      user: {
        id: user.id,
        name : user.name,
        email: user.email,
      },
    });
}
catch (error) {
  console.error(error); 
    return res.status(500).json({
      message: 'Server error',
    });
  }
};
module.exports = {register,login};