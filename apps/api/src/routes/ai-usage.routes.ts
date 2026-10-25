import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware';
import { AIUsageLog } from '../models/AIUsageLog';
import { env } from '../config/env';

const router = Router();

// GET /api/v1/ai-usage/summary
router.get('/summary', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayCount, monthLogs, totalLogs] = await Promise.all([
      AIUsageLog.countDocuments({ createdAt: { $gte: startOfToday } }),
      AIUsageLog.find({ createdAt: { $gte: startOfMonth } }),
      AIUsageLog.find({ userId: req.user!._id }).sort({ createdAt: -1 }).limit(50),
    ]);

    let totalTokens = 0;
    let totalCostUsd = 0;
    let successfulCount = 0;
    let failedCount = 0;
    let totalLatency = 0;
    let rateLimitHits = 0;

    for (const log of monthLogs) {
      totalTokens += log.totalTokens || 0;
      totalCostUsd += log.estimatedCostUsd || 0;
      totalLatency += log.durationMs || 0;
      if (log.success) successfulCount++;
      else failedCount++;
      if (log.errorCategory === 'RATE_LIMIT_EXCEEDED') rateLimitHits++;
    }

    const averageLatencyMs = monthLogs.length > 0 ? Math.round(totalLatency / monthLogs.length) : 0;
    const budgetUtilization = env.AI_MONTHLY_BUDGET > 0
      ? Math.min(100, Math.round((totalCostUsd / env.AI_MONTHLY_BUDGET) * 100))
      : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          requestsToday: todayCount,
          requestsThisMonth: monthLogs.length,
          successfulRequests: successfulCount,
          failedRequests: failedCount,
          totalTokensConsumed: totalTokens,
          totalEstimatedCostUsd: Number(totalCostUsd.toFixed(4)),
          averageLatencyMs,
          rateLimitHits,
          monthlyBudgetLimit: env.AI_MONTHLY_BUDGET,
          budgetUtilizationPercentage: budgetUtilization,
          modelInUse: env.GEMINI_MODEL,
        },
        recentLogs: totalLogs.map((l) => ({
          id: l._id,
          feature: l.feature,
          model: l.model,
          tokens: l.totalTokens,
          durationMs: l.durationMs,
          success: l.success,
          costUsd: l.estimatedCostUsd,
          createdAt: l.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

export const aiUsageRoutes = router;
