import { StatusCodes } from 'http-status-codes';
import db from '../../models/index.js';

const { Category,Product,sequelize,Sequelize,User } = db;

export const AddProduct = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, description, price, categoryId, stock } = req.body;

        if (!name || !price || !categoryId) {
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Please provide all required fields" });
        }
        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: "Category not found" });
        }
        const newProduct = await Product.create({ name, description, price, categoryId, stock: stock || 0, vendorId: userId });
        return res.status(StatusCodes.CREATED).json({ success: true, message: "Product added successfully", product: newProduct });

    } catch (error) {
        console.error("Error adding product:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" });
    }
}

export const GetAllProducts = async (req, res) => {
    const {categoryId,minPrice,maxPrice,search} = req.query || {};
    try {
        const products = await Product.findAll({
            where:{
                ...(categoryId ? { categoryId } : {}),
                ...(minPrice ? { price: { [Sequelize.Op.gte]: minPrice } } : {}),
                ...(maxPrice ? { price: { [Sequelize.Op.lte]: maxPrice } } : {}),
                ...(search ? { name: { [Sequelize.Op.like]: `%${search}%` } } : {}) 
            },
            include:[
                { model: Category, as: 'category', attributes: ['id', 'name'] },
            ],
            order:[['createdAt','DESC']]
        });
        return res.status(StatusCodes.OK).json({ success: true, products });        
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" });
    }
}

export const GetProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findByPk(id, {
            include: [
                { model: User, as: 'vendor', attributes: ['id', 'name'] },
                { model: Category, as: 'category', attributes: ['id', 'name'] }],
        });
        if (!product) {
            return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Product not found" });
        }
        return res.status(StatusCodes.OK).json({ success: true, product });
    } catch (error) {
        console.error("Error fetching product:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" });
    }
}

export const UpdateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, categoryId, stock } = req.body;

    try {
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Product not found" });
        }

        // Update product details
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.categoryId = categoryId || product.categoryId;
        product.stock = stock || product.stock;

        await product.save();

        return res.status(StatusCodes.OK).json({ success: true, message: "Product updated successfully", product });
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" });
    }
}

export const DeleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Product not found" });
        }
        await product.destroy();
        return res.status(StatusCodes.OK).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: "Internal server error" });
    }
}