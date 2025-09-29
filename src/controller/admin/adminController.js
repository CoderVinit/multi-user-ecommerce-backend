import db from "../../models/index.js"
import { StatusCodes } from "http-status-codes";

const {User,Order,Product} = db;

export const getAllUsers = async(req,res)=>{
    try {
        const users = await User.findAll({where:{role:'customer'},attributes:{exclude:['password']}})
        res.status(StatusCodes.OK).json({success:true,message:"User fetched Successfully",users});
    } catch (error) {
        console.log(error?.message || error)
        res.status(StatusCodes.BAD_REQUEST).json({success:false,message:error?.message})
    }
}

export const getAllVendors = async(req,res)=>{
    try {
        const vendors = await User.findAll({where:{role:'vendor'},attributes:{exclude:['password']}})
        res.status(StatusCodes.OK).json({success:true,message:"Vendors fetched Successfully",vendors});
    } catch (error) {
        console.log(error?.message || error)
        res.status(StatusCodes.BAD_REQUEST).json({success:false,message:error?.message})
    }
}

export const getAllOrders = async(req,res)=>{

    try {
        let select = {}
        if(req.query.status){
            select.status = req.query.status
        }
        const orders = await Order.findAll({where:select});
        res.status(StatusCodes.OK).json({success:true,message:"Orders fetched Successfully",orders});
    } catch (error) {
        console.log(error?.message || error)
        res.status(StatusCodes.BAD_REQUEST).json({success:false,message:error?.message})
    }
}

// PUT /api/v1/admin/orders/:id/status  body: { status }
export const updateOrderStatus = async (req,res)=>{
  try {
    const { id } = req.params;
    const { status, force } = req.body || {};
    if(!id) return res.status(StatusCodes.BAD_REQUEST).json({success:false,message:"Order id required"});
    if(!status) return res.status(StatusCodes.BAD_REQUEST).json({success:false,message:"Status required"});

    const allowed = ['pending','paid','shipped','delivered','cancelled'];
    if(!allowed.includes(status)){
      return res.status(StatusCodes.BAD_REQUEST).json({success:false,message:`Invalid status. Allowed: ${allowed.join(', ')}`});
    }

    const order = await Order.findByPk(id);
    if(!order){
      return res.status(StatusCodes.NOT_FOUND).json({success:false,message:"Order not found"});
    }

    // Idempotent: if already desired status
    if(order.status === status){
      return res.status(StatusCodes.OK).json({success:true,message:"Order already in requested status",order});
    }

    const transitions = {
      pending: ['paid','cancelled'],
      paid: ['shipped','cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: []
    };

    const current = order.status;
    const canTransition = transitions[current]?.includes(status);

    if(!canTransition && !force){
      return res.status(StatusCodes.BAD_REQUEST).json({success:false,message:`Cannot transition from ${current} to ${status}. Use force=true to override.`});
    }

    await order.update({ status });
    return res.status(StatusCodes.OK).json({success:true,message: force && !canTransition ? "Order status force-updated" : "Order status updated",order});
  } catch (error) {
    console.error(error?.message || error);
    // Map MySQL enum truncation to clearer message
    if(/Data truncated for column 'status'/.test(error?.message||'')){
      return res.status(StatusCodes.BAD_REQUEST).json({success:false,message:"Status value not recognized by database enum. Ensure migrations are up to date."});
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:error?.message || 'Failed to update order status'});
  }
};

export const deleteProductById = async(req,res)=>{
    try {
        const {id} = req.params;
        if(!id) return res.status(StatusCodes.BAD_REQUEST).json({success:false,message:"Product id required"});
        const product = await Product.findByPk(id);
        if(!product) return res.status(StatusCodes.NOT_FOUND).json({success:false,message:"Product not found"});
        await product.destroy();
        return res.status(StatusCodes.OK).json({success:true,message:"Product deleted successfully"});
    } catch (error) {
        console.error(error?.message || error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:error?.message || 'Failed to delete product'});
    }
};