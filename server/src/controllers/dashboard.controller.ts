import { Request, Response, NextFunction } from 'express';
import { Registration } from '../models/Registration.js';
import { ProblemArea } from '../models/ProblemArea.js';

export async function getDashboardSummary(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const baseFilter = { deletedAt: null };

    // 1. Total registrations & teams
    const totalRegistrations = await Registration.countDocuments(baseFilter);
    const uniqueTeamsCount = (await Registration.distinct('teamName', baseFilter)).length;

    // 2. Field visit distribution
    const fieldVisitYesCount = await Registration.countDocuments({
      ...baseFilter,
      fieldVisitStatus: 'Yes',
    });
    const fieldVisitNoCount = await Registration.countDocuments({
      ...baseFilter,
      fieldVisitStatus: 'No',
    });

    // 3. Total members count via aggregation
    const membersAggregation = await Registration.aggregate([
      { $match: baseFilter },
      { $project: { memberCount: { $size: { $ifNull: ['$members', []] } } } },
      { $group: { _id: null, totalMembers: { $sum: '$memberCount' } } },
    ]);
    const totalMembers = membersAggregation[0]?.totalMembers || 0;

    // 4. Category-wise statistics with official problem areas
    const officialAreas = await ProblemArea.find().sort({ displayOrder: 1 });
    const categoryCountsAggregation = await Registration.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: '$categoryNameSnapshot',
          count: { $sum: 1 },
          abbreviation: { $first: '$categoryAbbreviationSnapshot' },
        },
      },
    ]);

    const countsMap = new Map<string, number>();
    categoryCountsAggregation.forEach((item) => {
      countsMap.set(item._id, item.count);
    });

    const categoryStats = officialAreas.map((area) => ({
      categoryId: area._id,
      name: area.name,
      abbreviation: area.abbreviation,
      isOther: area.isOther,
      count: countsMap.get(area.name) || 0,
    }));

    // 5. Recent registrations
    const recentRegistrations = await Registration.find(baseFilter)
      .sort({ createdAt: -1 })
      .limit(6)
      .select('projectId teamName projectTitle categoryNameSnapshot createdAt fieldVisitStatus');

    res.json({
      success: true,
      data: {
        summary: {
          totalRegistrations,
          totalTeams: uniqueTeamsCount,
          totalMembers,
          fieldVisitYesCount,
          fieldVisitNoCount,
        },
        categoryStats,
        recentRegistrations,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getTimeSeriesStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const timeSeriesAggregation = await Registration.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formattedData = timeSeriesAggregation.map((item) => ({
      date: item._id,
      count: item.count,
    }));

    res.json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    next(error);
  }
}
