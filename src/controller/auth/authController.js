import { StatusCodes } from 'http-status-codes';
import db from "../../models/index.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';

const {User,sequelize} = db;

export const RegisterUser = async (req, res) => {
    let t;
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Please provide all required fields" });
        }

        t = await sequelize.transaction();

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email }, transaction: t });
        if (existingUser) {
            await t.rollback();
            return res.status(StatusCodes.CONFLICT).json({ success: false, message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = await User.create({ name, email, password:hashedPassword, role }, { transaction: t });
        await t.commit();

        // Exclude sensitive fields
        const { password: _ignored, ...safeUser } = newUser.get({ plain: true });
        return res.status(StatusCodes.CREATED).json({ success: true, message: "User registered successfully", user: safeUser });

    } catch (error) {
        if (t) {
            try { await t.rollback(); } catch { /* ignore */ }
        }
        console.error(error?.message || error);
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: error?.message || "Registration failed" });
    }
}



export const LoginUser = async(req,res)=>{

    try {
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(StatusCodes.BAD_REQUEST).json({success:false,message:"Please provide all required fields"});
        }
        const user = await User.findOne({where:{email}});
        if(!user){
            return res.status(StatusCodes.UNAUTHORIZED).json({success:false,message:"Invalid credentials"});
        }
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(StatusCodes.UNAUTHORIZED).json({success:false,message:"Invalid credentials"});
        }  
        
    const token = jwt.sign({id:user.id,role:user.role},process.env.JWT_SECRET,{expiresIn:'1d'});
    const { password: _ignored, ...safeUser } = user.get({ plain: true });
    return res.status(StatusCodes.OK).json({success:true,message:"Login successful",token,user:safeUser});
        
    } catch (error) {
        console.error(error?.message || error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:error?.message || "Login failed"});
    }

}


export const getProfile = async(req,res)=>{
try {
    const userId = req.user?.id;
    if(!userId){
        return res.status(StatusCodes.UNAUTHORIZED).json({success:false,message:"Unauthorized"});
    }
    const user = await User.findByPk(userId,{ attributes: { exclude: ['password'] } });
    if(!user){
        return res.status(StatusCodes.NOT_FOUND).json({success:false,message:"User not found"});
    }
    return res.status(StatusCodes.OK).json({success:true,user});
} catch (error) {
    console.error(error?.message || error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:error?.message || "Failed to retrieve profile"});
}
}