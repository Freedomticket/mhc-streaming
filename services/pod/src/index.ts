import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { prisma } from '@mhc/database';
import { successResponse, errorResponse, ERROR_CODES, HTTP_STATUS } from '@mhc/common';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3010;

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'pod-service',
    timestamp: new Date().toISOString() 
  });
});

// Get available products
app.get('/api/pod/products', async (req, res) => {
  try {
    // Mock product catalog (in production, integrate with Printful/Printify API)
    const products = [
      { id: 'tshirt', name: 'T-Shirt', basePrice: 19.99, sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
      { id: 'hoodie', name: 'Hoodie', basePrice: 39.99, sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
      { id: 'poster', name: 'Poster', basePrice: 14.99, sizes: ['12x18', '18x24', '24x36'] },
      { id: 'mug', name: 'Coffee Mug', basePrice: 12.99, sizes: ['11oz', '15oz'] },
      { id: 'sticker', name: 'Sticker Pack', basePrice: 4.99, sizes: ['3x3', '4x4'] },
    ];
    
    res.json(successResponse(products));
  } catch (error) {
    console.error('Get products error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to fetch products' })
    );
  }
});

// Create custom merch design
app.post('/api/pod/designs', async (req, res) => {
  try {
    const { artistId, productType, designUrl, title, description } = req.body;
    
    if (!artistId || !productType || !designUrl || !title) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'Missing required fields' })
      );
    }
    
    // Create design record (simplified - would store in DB)
    const design = {
      id: `design_${Date.now()}`,
      artistId,
      productType,
      designUrl,
      title,
      description: description || '',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    
    console.log('Created POD design:', design);
    
    res.json(successResponse(design));
  } catch (error) {
    console.error('Create design error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to create design' })
    );
  }
});

// Get artist's designs
app.get('/api/pod/designs/:artistId', async (req, res) => {
  try {
    const { artistId } = req.params;
    
    // In production, query Design model
    res.json(successResponse({
      artistId,
      designs: [],
    }));
  } catch (error) {
    console.error('Get designs error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to fetch designs' })
    );
  }
});

// Create order
app.post('/api/pod/orders', async (req, res) => {
  try {
    const { userId, designId, productType, size, quantity, shippingAddress } = req.body;
    
    if (!userId || !designId || !productType || !size || !quantity || !shippingAddress) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json(
        errorResponse({ code: ERROR_CODES.INVALID_INPUT, message: 'Missing required fields' })
      );
    }
    
    // Create order (in production, integrate with POD provider API)
    const order = {
      id: `order_${Date.now()}`,
      userId,
      designId,
      productType,
      size,
      quantity,
      shippingAddress,
      status: 'PENDING',
      total: 19.99 * quantity, // Calculate based on product price
      createdAt: new Date().toISOString(),
    };
    
    console.log('Created POD order:', order);
    
    res.json(successResponse(order));
  } catch (error) {
    console.error('Create order error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to create order' })
    );
  }
});

// Get order status
app.get('/api/pod/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Mock order status (in production, query POD provider API)
    res.json(successResponse({
      orderId,
      status: 'IN_PRODUCTION',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }));
  } catch (error) {
    console.error('Get order status error:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ code: ERROR_CODES.INTERNAL_ERROR, message: 'Failed to fetch order status' })
    );
  }
});

app.listen(PORT, () => {
  console.log(`🎨 POD service running on port ${PORT}`);
});
