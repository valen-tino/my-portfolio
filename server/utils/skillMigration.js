const Portfolio = require('../models/Portfolio');
const TechTool = require('../models/TechTool');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Scans all portfolio documents, extracts all unique technologies,
 * and atomically provisions any uncataloged skills into TechTool as drafts.
 */
const syncAllPortfolioSkills = async () => {
  try {
    const portfolios = await Portfolio.find({}, 'tech');
    const rawSkills = portfolios.flatMap((p) => p.tech || []);

    const seen = new Set();
    const uniqueSkills = [];
    for (const raw of rawSkills) {
      const trimmed = String(raw || '').trim();
      if (!trimmed) continue;
      const lower = trimmed.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        uniqueSkills.push(trimmed);
      }
    }

    if (uniqueSkills.length === 0) {
      return { totalSkillsFound: 0, createdCount: 0 };
    }

    const operations = uniqueSkills.map((skill) => ({
      updateOne: {
        filter: { title: { $regex: new RegExp(`^${escapeRegex(skill)}$`, 'i') } },
        update: {
          $setOnInsert: {
            title: skill,
            imageURL: '/placeholder-tech.svg',
            imageCloudinaryId: null,
            order: 0,
            isPublished: false
          }
        },
        upsert: true
      }
    }));

    const result = await TechTool.bulkWrite(operations, { ordered: false });
    const createdCount = result.upsertedCount || 0;

    return {
      totalSkillsFound: uniqueSkills.length,
      createdCount
    };
  } catch (error) {
    console.error('Error during syncAllPortfolioSkills:', error);
    throw error;
  }
};

module.exports = {
  syncAllPortfolioSkills
};

