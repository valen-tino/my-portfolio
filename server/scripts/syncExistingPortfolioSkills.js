const mongoose = require('mongoose');
const { syncAllPortfolioSkills } = require('../utils/skillMigration');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio';

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('Scanning all portfolio records for uncataloged skills...');
    const result = await syncAllPortfolioSkills();

    console.log('==============================================');
    console.log(`Total unique skills discovered in portfolios: ${result.totalSkillsFound}`);
    console.log(`New draft tech tools provisioned: ${result.createdCount}`);
    console.log('==============================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

run();

