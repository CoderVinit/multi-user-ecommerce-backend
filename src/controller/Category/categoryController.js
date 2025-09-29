
import { StatusCodes } from 'http-status-codes';
import db from '../../models/index.js';

const { Category } = db;

export const CreateCategory = async (req, res) => {
    try {
        const { name, parentId } = req.body || {};

        if (!name || !name.trim()) {
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Name is required' });
        }

        // Validate parentId if provided
        let parent = null;
        if (parentId !== undefined && parentId !== null) {
            if (Number.isNaN(Number(parentId))) {
                return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid parentId' });
            }
            parent = await Category.findByPk(parentId);
            if (!parent) {
                return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Parent category not found' });
            }
        }

        const created = await Category.create({ name: name.trim(), parentId: parent ? parent.id : null });
        return res.status(StatusCodes.CREATED).json({ success: true, message: 'Category created', category: created });
    } catch (error) {
        console.error(error?.message || error);
        if (error?.name === 'SequelizeUniqueConstraintError') {
            return res.status(StatusCodes.CONFLICT).json({ success: false, message: 'Category name must be unique' });
        }
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error?.message || 'Failed to create category' });
    }
};

export const GetAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            attributes: ['id', 'name', 'parentId'],
            include: [
                {
                    model: Category,
                    as: 'subcategories',
                    attributes: ['id', 'name', 'parentId']
                }
            ],
            order: [['name', 'ASC']]
        });
        return res.status(StatusCodes.OK).json({ success: true, categories });
    } catch (error) {
        console.error(error?.message || error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error?.message || 'Failed to list categories' });
    }
};


export const getCategoryById = async(req,res)=>{
    const id = req.params.id;
    try {
        const category = await Category.findByPk(id,{
            attributes: ['id', 'name'],
            include: [
                {
                    model: Category,
                    as: 'subcategories',
                    attributes: ['id', 'name', 'parentId']
                }
            ]
        });
        if (!category) {
            return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Category not found' });
        }
        return res.status(StatusCodes.OK).json({ success: true, category });
    } catch (error) {
        
    }
}

export const UpdateCategory = async(req,res)=>{
    const id = req.params.id;
    try {
        const category = await Category.findByPk(id);
        if(!category){
            return res.status(StatusCodes.NOT_FOUND).json({success:false,message:"Category not found"});
        }
        const {name,parentId} = req.body || {};
        const updates = {};
        if(typeof name === 'string' && name.trim()) updates.name = name.trim();
        if(typeof parentId === 'string' && parentId.trim()) {
            const parent = await Category.findByPk(parentId);
            if(!parent) {
                return res.status(StatusCodes.BAD_REQUEST).json({success:false,message:"Parent category not found"});
            }
            updates.parentId = parent.id;
        }
        await Category.update(updates,{where:{id}});
        return res.status(StatusCodes.OK).json({success:true,message:"Category updated successfully"});
    } catch (error) {
        console.error(error?.message || error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:error?.message || "Failed to update category"});
    }
}

export const DeleteCategory = async(req,res)=>{
    const id = req.params.id;
    try {
        const category = await Category.findByPk(id);
        if(!category){
            return res.status(StatusCodes.NOT_FOUND).json({success:false,message:"Category not found"});
        }
        await Category.destroy({where:{id}});
        return res.status(StatusCodes.OK).json({success:true,message:"Category deleted successfully"});
    } catch (error) {
        console.error(error?.message || error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({success:false,message:error?.message || "Failed to delete category"});
    }
}