// import jwt from "jsonwebtoken"
// import  users from '../models/auth.js'
// export const login = async(req,res)=>{
//     const {email}=req.body;
//       console.log(email);
//     try {
//         const existingUser= await users.findOne({email});
//         if(!existingUser){
//             try {
//                 const newUser= await users.create({email});

//                 const token= jwt.sign({
//                     email:newUser.email, id:newUser._id
//                 },process.env.JWT_SECRET,{
//                     expiresIn:"1h"
//                 })
//                 res.status(200).json({result:newUser,token})
//             } catch (error) {
//                 res.status(500).json({mess:"Something wents wrong..."});
//             }
//         }else{

//             const token=jwt.sign({
//                 email:existingUser.email, id:existingUser._id
//             },process.env.JWT_SECRET,{
//                 expiresIn:"1h"
//             })
//             res.status(200).json({result:existingUser,token})
//         }
//     } catch (error) {
//         res.status(500).json({mess:"something wents wrong..."})
//     }
// }
import jwt from 'jsonwebtoken';
import users from '../models/auth.js';

export const login = async (req, res) => {
  const { email } = req.body;
  console.log('Received email:', email);

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const existingUser = await users.findOne({ email });

    if (!existingUser) {
      try {
        const newUser = await users.create({ email });

        const token = jwt.sign(
          {
            email: newUser.email,
            id: newUser._id,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: '1h',
          }
        );

        return res.status(201).json({ result: newUser, token });
      } catch (error) {
        console.error('Error creating new user:', error);
        return res.status(500).json({ message: 'Error creating new user' });
      }
    } else {
      const token = jwt.sign(
        {
          email: existingUser.email,
          id: existingUser._id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '1h',
        }
      );

      return res.status(200).json({ result: existingUser, token });
    }
  } catch (error) {
    console.error('Error finding user:', error);
    return res.status(500).json({ message: 'Error finding user' });
  }
};
