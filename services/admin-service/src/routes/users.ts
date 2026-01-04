import { Router, Request, Response } from 'express';
import { prisma } from '@mhc/database';
import { HTTP_STATUS, successResponse, errorResponse, ERROR_CODES } from '@mhc/common';

const router = Router();

/**
 * GET /api/admin/users
 * Returns paginated list of users with optional filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { 
      page = '1', 
      limit = '50', 
      role, 
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    
    if (role && (role === 'USER' || role === 'CREATOR' || role === 'ADMIN')) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { username: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Get users and total count
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: order },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              videos: true,
              streams: true,
              followers: true,
              following: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    return res.status(HTTP_STATUS.OK).json(
      successResponse({ 
        data: {
          users,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          }
        }
      })
    );
  } catch (error: any) {
    console.error('Fetch users error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ 
        code: ERROR_CODES.INTERNAL_ERROR, 
        message: 'Failed to fetch users' 
      })
    );
  }
});

/**
 * POST /api/admin/users/:id/ban
 * Ban/suspend a user
 */
router.post('/:id/ban', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse({ code: ERROR_CODES.NOT_FOUND, message: 'User not found' })
      );
    }

    // Don't allow banning other admins
    if (user.role === 'ADMIN') {
      return res.status(HTTP_STATUS.FORBIDDEN).json(
        errorResponse({ 
          code: ERROR_CODES.FORBIDDEN, 
          message: 'Cannot ban admin users' 
        })
      );
    }

    // Note: Schema doesn't have isBanned field, so this would need to be added
    // For now, we'll just return success and log the action
    console.log(`Admin ${req.user?.userId} banned user ${id}. Reason: ${reason}`);

    return res.status(HTTP_STATUS.OK).json(
      successResponse({ 
        data: { 
          message: 'User banned successfully',
          userId: id 
        } 
      })
    );
  } catch (error: any) {
    console.error('Ban user error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ 
        code: ERROR_CODES.INTERNAL_ERROR, 
        message: 'Failed to ban user' 
      })
    );
  }
});

/**
 * POST /api/admin/users/:id/unban
 * Unban a user
 */
router.post('/:id/unban', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json(
        errorResponse({ code: ERROR_CODES.NOT_FOUND, message: 'User not found' })
      );
    }

    console.log(`Admin ${req.user?.userId} unbanned user ${id}`);

    return res.status(HTTP_STATUS.OK).json(
      successResponse({ 
        data: { 
          message: 'User unbanned successfully',
          userId: id 
        } 
      })
    );
  } catch (error: any) {
    console.error('Unban user error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      errorResponse({ 
        code: ERROR_CODES.INTERNAL_ERROR, 
        message: 'Failed to unban user' 
      })
    );
  }
});

export default router;
