const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const app = express();
const prisma = new PrismaClient();


app.use(cors({
  origin: 'http://localhost:3000',  
  credentials: true,                
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products', 
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
  },
});

const upload = multer({ storage });


function verifyToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    
    if (err.name === 'TokenExpiredError') {
      res.clearCookie('token'); 
      return res.status(401).json({ error: 'Session expired, please login again' });
    }
    
    return res.status(403).json({ error: 'Invalid authentication token' });
  }
}


app.post('/api/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;


  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'user'
      },
    });

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});


app.get('/api/me', verifyToken, (req, res) => {
  try {
    const { password, ...userData } = req.user;
    res.json(userData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Failed to retrieve user data' });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/categories', async (req, res) => {
  try {
    const categoryTree = await getCategoryTree();
    res.json(categoryTree);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { name, parentId } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Category name is required' });
  }

  try {
    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parseInt(parentId) }
      });

      if (!parentCategory) {
        return res.status(404).json({ error: 'Parent category not found' });
      }
    }

    const newCategory = await prisma.category.create({
      data: {
        name: name.trim(),
        parentId: parentId ? parseInt(parentId) : null,
      }
    });

    res.status(201).json(newCategory);
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

app.put('/api/categories/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const categoryId = parseInt(req.params.id);
  
  if (isNaN(categoryId)) {
    return res.status(400).json({ error: 'Invalid category ID' });
  }
  
  const { name, parentId } = req.body;
  
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    if (parentId && parseInt(parentId) === categoryId) {
      return res.status(400).json({ error: 'Category cannot be its own parent' });
    }
    if (parentId) {
      const newParentId = parseInt(parentId);
      const isDescendant = await isDescendantOf(newParentId, categoryId);
      if (isDescendant) {
        return res.status(400).json({ error: 'Cannot move category into its own subcategory' });
      }
    }
    
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: name !== undefined ? name : category.name,
        parentId: parentId !== undefined ? (parentId ? parseInt(parentId) : null) : category.parentId
      }
    });
    
    res.json(updatedCategory);
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
});


async function isDescendantOf(potentialDescendantId, ancestorId) {
  const category = await prisma.category.findUnique({
    where: { id: potentialDescendantId }
  });
  
  if (!category) {
    return false;
  }
  
  if (category.parentId === null) {
    return false;
  }
  
  if (category.parentId === ancestorId) {
    return true;
  }
  
  return await isDescendantOf(category.parentId, ancestorId);
}

app.get('/api/categories/:id/products', verifyToken, async (req, res) => {
  const categoryId = parseInt(req.params.id);
  
  if (isNaN(categoryId)) {
    return res.status(400).json({ error: 'Invalid category ID' });
  }
  
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const products = await prisma.product.findMany({
      where: { categoryId }
    });
    
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.delete('/api/categories/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const categoryId = parseInt(req.params.id);
  
  if (isNaN(categoryId)) {
    return res.status(400).json({ error: 'Invalid category ID' });
  }
  
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    const subcategories = await prisma.category.findMany({
      where: { parentId: categoryId }
    });
    
    if (subcategories.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category that contains subcategories. Delete all subcategories first.' 
      });
    }
    
    const products = await prisma.product.findMany({
      where: { categoryId }
    });
    
    if (products.length > 0) {
      await prisma.product.updateMany({
        where: { categoryId },
        data: { categoryId: null }
      });
    }
    await prisma.category.delete({
      where: { id: categoryId }
    });
    
    res.json({ message: 'Category successfully deleted' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

async function getCategoryTree() {
  const allCategories = await prisma.category.findMany({
    orderBy: {
      name: 'asc'
    }
  });

  const categoryMap = new Map();
  allCategories.forEach(category => {
    category.children = [];
    categoryMap.set(category.id, category);
  });

  const rootCategories = [];
  
  allCategories.forEach(category => {
    if (category.parentId === null) {
      rootCategories.push(category);
    } else {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children.push(category);
      }
    }
  });

  return rootCategories;
}

app.post('/api/products', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { title, description, price, image, categoryId } = req.body;

  if (!title || !description || !price || !image || !categoryId) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) }
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const newProduct = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        image,
        categoryId: parseInt(categoryId)
      }
    });

    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true
      }
    });
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/upload', verifyToken, upload.single('image'), async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const imageUrl = req.file.path; 
    res.status(200).json({ url: imageUrl });
  } catch (err) {
    console.error('Error uploading image:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

app.get('/api/orders', verifyToken, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id }
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
});


app.put('/api/products/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const productId = parseInt(req.params.id);
  
  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }
  
  const { title, description, price, image, categoryId } = req.body;

  if (!title || !description || price === undefined || !image) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  try {

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    

    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) }
      });
      
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        title,
        description,
        price: parseFloat(price),
        image,
        categoryId: categoryId ? parseInt(categoryId) : null
      }
    });

    res.json(updatedProduct);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

app.delete('/api/products/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const productId = parseInt(req.params.id);
  
  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }
  
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    await prisma.product.delete({
      where: { id: productId }
    });
    
    res.json({ message: 'Product successfully deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});


app.get('/api/products', async (req, res) => {
  const { title, description, price, category } = req.query;

  try {
    const filters = {};

    if (title) {
      filters.title = {
        contains: title,
        mode: 'insensitive', 
      };
    }
    if (description) {
      filters.description = {
        contains: description,
        mode: 'insensitive',
      };
    }
    if (price) {
      filters.price = {
        lte: parseFloat(price), 
      };
    }
    if (category) {
      filters.categoryId = parseInt(category); 
    }

    const products = await prisma.product.findMany({
      where: filters,
      include: {
        category: true,
      },
    });

    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});


app.get('/api/banner', async (req, res) => {
  try {
    const slides = await prisma.bannerSlide.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' }
    });
    res.json(slides);
  } catch (err) {
    console.error('Error fetching banner slides:', err);
    res.status(500).json({ error: 'Failed to fetch banner slides' });
  }
});

app.get('/api/cms/banner', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const slides = await prisma.bannerSlide.findMany({
      orderBy: { displayOrder: 'asc' }
    });
    res.json(slides);
  } catch (err) {
    console.error('Error fetching banner slides:', err);
    res.status(500).json({ error: 'Failed to fetch banner slides' });
  }
});

app.post('/api/cms/banner', verifyToken, upload.single('image'), async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  try {
    const { title, subtitle, linkUrl, isActive } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image is required' });
    }

    const highestOrder = await prisma.bannerSlide.findFirst({
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true }
    });
    
    const displayOrder = highestOrder ? highestOrder.displayOrder + 1 : 0;

    const newSlide = await prisma.bannerSlide.create({
      data: {
        title: title || null,
        subtitle: subtitle || null,
        imageUrl,
        linkUrl: linkUrl || null,
        isActive: isActive === 'true',
        displayOrder
      }
    });

    res.status(201).json(newSlide);
  } catch (err) {
    console.error('Error creating banner slide:', err);
    res.status(500).json({ error: 'Failed to create banner slide' });
  }
});


app.put('/api/cms/banner/:id', verifyToken, upload.single('image'), async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const slideId = parseInt(req.params.id);
  
  if (isNaN(slideId)) {
    return res.status(400).json({ error: 'Invalid slide ID' });
  }

  try {
    const slide = await prisma.bannerSlide.findUnique({
      where: { id: slideId }
    });
    
    if (!slide) {
      return res.status(404).json({ error: 'Slide not found' });
    }

    const { title, subtitle, linkUrl, isActive, displayOrder } = req.body;
    const imageUrl = req.file ? req.file.path : undefined;

    const updatedSlide = await prisma.bannerSlide.update({
      where: { id: slideId },
      data: {
        title: title === undefined ? slide.title : title || null,
        subtitle: subtitle === undefined ? slide.subtitle : subtitle || null,
        imageUrl: imageUrl || slide.imageUrl,
        linkUrl: linkUrl === undefined ? slide.linkUrl : linkUrl || null,
        isActive: isActive === undefined ? slide.isActive : isActive === 'true',
        displayOrder: displayOrder === undefined ? slide.displayOrder : parseInt(displayOrder)
      }
    });

    res.json(updatedSlide);
  } catch (err) {
    console.error('Error updating banner slide:', err);
    res.status(500).json({ error: 'Failed to update banner slide' });
  }
});

app.delete('/api/cms/banner/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const slideId = parseInt(req.params.id);
  
  if (isNaN(slideId)) {
    return res.status(400).json({ error: 'Invalid slide ID' });
  }
  
  try {
    const slide = await prisma.bannerSlide.findUnique({
      where: { id: slideId }
    });
    
    if (!slide) {
      return res.status(404).json({ error: 'Slide not found' });
    }
    
    await prisma.bannerSlide.delete({
      where: { id: slideId }
    });
    
    res.json({ message: 'Banner slide successfully deleted' });
  } catch (err) {
    console.error('Error deleting banner slide:', err);
    res.status(500).json({ error: 'Failed to delete banner slide' });
  }
});

app.post('/api/cms/banner/reorder', verifyToken, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'content-manager') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { slideIds } = req.body;
  
  if (!Array.isArray(slideIds)) {
    return res.status(400).json({ error: 'Invalid slideIds array' });
  }
  
  try {
    const updates = slideIds.map((id, index) => {
      return prisma.bannerSlide.update({
        where: { id: parseInt(id) },
        data: { displayOrder: index }
      });
    });
    
    await Promise.all(updates);
    
    res.json({ message: 'Banner slides successfully reordered' });
  } catch (err) {
    console.error('Error reordering banner slides:', err);
    res.status(500).json({ error: 'Failed to reorder banner slides' });
  }
});


app.get('/api/users', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.put('/api/users/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    
    const userId = parseInt(req.params.id);
    const { firstName, lastName, email, role } = req.body;
    
    if (!firstName || !lastName || !email || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (userId === req.user.id && role !== 'admin') {
      return res.status(400).json({ error: 'You cannot remove your own admin privileges' });
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        email,
        role
      }
    });

    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const userId = parseInt(req.params.id);
    
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }
    
    await prisma.user.delete({
      where: {
        id: userId
      }
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});


app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});


app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});