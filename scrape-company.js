// Example: Scrape LinkedIn Company Page

const { CrawlingAPI } = require('crawlbase');

const api = new CrawlingAPI({ token: 'YOUR_CRAWLBASE_TOKEN' });

/**
 * Scrape detailed company information
 */
async function scrapeCompanyDetails(companyUrl) {
  console.log(`Scraping LinkedIn company: ${companyUrl}\n`);
  
  try {
    const response = await api.get(companyUrl, {
      scraper: 'linkedin-company-scraper',
      format: 'json',
      ajax_wait: true
    });
    
    const company = JSON.parse(response.body);
    
    // Display company information
    console.log('═══════════════════════════════════════');
    console.log('         COMPANY OVERVIEW              ');
    console.log('═══════════════════════════════════════\n');
    
    console.log(`Company Name: ${company.name}`);
    console.log(`Industry: ${company.industry}`);
    console.log(`Company Size: ${company.company_size}`);
    console.log(`Headquarters: ${company.headquarters}`);
    console.log(`Type: ${company.company_type || 'Not specified'}`);
    console.log(`Founded: ${company.founded || 'Not specified'}`);
    
    if (company.website) {
      console.log(`Website: ${company.website}`);
    }
    
    if (company.specialties && company.specialties.length > 0) {
      console.log(`\nSpecialties: ${company.specialties.join(', ')}`);
    }
    
    // Social metrics
    console.log('\n═══════════════════════════════════════');
    console.log('          SOCIAL METRICS               ');
    console.log('═══════════════════════════════════════\n');
    
    console.log(`Followers: ${company.followers || 'N/A'}`);
    console.log(`Employees on LinkedIn: ${company.employees_on_linkedin || 'N/A'}`);
    
    // About section
    if (company.description) {
      console.log('\n═══════════════════════════════════════');
      console.log('               ABOUT                   ');
      console.log('═══════════════════════════════════════\n');
      console.log(company.description);
    }
    
    // Recent updates
    if (company.recent_posts && company.recent_posts.length > 0) {
      console.log('\n═══════════════════════════════════════');
      console.log('          RECENT UPDATES               ');
      console.log('═══════════════════════════════════════\n');
      
      company.recent_posts.slice(0, 5).forEach((post, index) => {
        console.log(`${index + 1}. ${post.text?.substring(0, 100) || 'Post content'}...`);
        console.log(`   Posted: ${post.date || 'Date not available'}`);
        console.log(`   Engagement: ${post.likes || 0} likes, ${post.comments || 0} comments\n`);
      });
    }
    
    // Job openings
    if (company.job_openings) {
      console.log('═══════════════════════════════════════');
      console.log('           JOB OPENINGS                ');
      console.log('═══════════════════════════════════════\n');
      
      console.log(`Total Open Positions: ${company.job_openings.count || 0}`);
      
      if (company.job_openings.positions && company.job_openings.positions.length > 0) {
        console.log('\nFeatured Positions:\n');
        company.job_openings.positions.slice(0, 5).forEach((job, index) => {
          console.log(`${index + 1}. ${job.title}`);
          console.log(`   Location: ${job.location || 'Not specified'}`);
          console.log(`   Level: ${job.level || 'Not specified'}\n`);
        });
      }
    }
    
    // Affiliated companies
    if (company.affiliated_companies && company.affiliated_companies.length > 0) {
      console.log('═══════════════════════════════════════');
      console.log('       AFFILIATED COMPANIES            ');
      console.log('═══════════════════════════════════════\n');
      
      company.affiliated_companies.forEach(affiliate => {
        console.log(`• ${affiliate.name} (${affiliate.industry || 'Industry not specified'})`);
      });
    }
    
    // Company insights
    console.log('\n═══════════════════════════════════════');
    console.log('         COMPANY INSIGHTS              ');
    console.log('═══════════════════════════════════════\n');
    
    const insights = analyzeCompany(company);
    
    console.log(`Growth Stage: ${insights.growthStage}`);
    console.log(`Social Presence: ${insights.socialPresence}`);
    console.log(`Hiring Activity: ${insights.hiringActivity}`);
    console.log(`Employee Engagement: ${insights.engagement}`);
    
    // Save to file
    const fs = require('fs');
    const timestamp = Date.now();
    const companyName = company.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `company_${companyName}_${timestamp}.json`;
    fs.writeFileSync(filename, JSON.stringify(company, null, 2));
    
    console.log(`\n✓ Full company data saved to ${filename}`);
    
    return company;
    
  } catch (error) {
    console.error('Error scraping company:', error.message);
    throw error;
  }
}

/**
 * Analyze company metrics and provide insights
 */
function analyzeCompany(company) {
  const insights = {};
  
  // Determine growth stage
  const size = company.company_size || '';
  if (size.includes('10,001+') || size.includes('5,001-10,000')) {
    insights.growthStage = 'Enterprise';
  } else if (size.includes('501-5,000') || size.includes('201-500')) {
    insights.growthStage = 'Growth Stage';
  } else if (size.includes('51-200') || size.includes('11-50')) {
    insights.growthStage = 'Startup/Scale-up';
  } else {
    insights.growthStage = 'Early Stage';
  }
  
  // Analyze social presence
  const followers = parseInt((company.followers || '0').replace(/[^0-9]/g, ''));
  if (followers > 100000) {
    insights.socialPresence = 'Very Strong';
  } else if (followers > 10000) {
    insights.socialPresence = 'Strong';
  } else if (followers > 1000) {
    insights.socialPresence = 'Moderate';
  } else {
    insights.socialPresence = 'Building';
  }
  
  // Analyze hiring activity
  const jobCount = company.job_openings?.count || 0;
  if (jobCount > 50) {
    insights.hiringActivity = 'Very Active (Rapid Growth)';
  } else if (jobCount > 10) {
    insights.hiringActivity = 'Active (Expanding)';
  } else if (jobCount > 0) {
    insights.hiringActivity = 'Moderate (Selective Hiring)';
  } else {
    insights.hiringActivity = 'Low (Stable/Not Hiring)';
  }
  
  // Analyze engagement
  const postsCount = company.recent_posts?.length || 0;
  if (postsCount >= 5) {
    insights.engagement = 'Highly Active';
  } else if (postsCount >= 2) {
    insights.engagement = 'Active';
  } else if (postsCount >= 1) {
    insights.engagement = 'Occasional';
  } else {
    insights.engagement = 'Minimal';
  }
  
  return insights;
}

/**
 * Track company growth over time
 */
async function trackCompanyGrowth(companyUrl, intervalDays = 30) {
  console.log(`Setting up company growth tracking for ${intervalDays} day intervals...\n`);
  
  const history = [];
  
  const checkGrowth = async () => {
    try {
      const company = await scrapeCompanyDetails(companyUrl);
      
      const snapshot = {
        timestamp: new Date().toISOString(),
        followers: company.followers,
        employees: company.employees_on_linkedin,
        jobOpenings: company.job_openings?.count || 0
      };
      
      history.push(snapshot);
      
      console.log('\n📊 Growth Snapshot:');
      console.log(`   Followers: ${snapshot.followers}`);
      console.log(`   Employees: ${snapshot.employees}`);
      console.log(`   Open Positions: ${snapshot.jobOpenings}`);
      
      if (history.length > 1) {
        const previous = history[history.length - 2];
        console.log('\n📈 Changes:');
        console.log(`   Followers: ${calculateChange(previous.followers, snapshot.followers)}`);
        console.log(`   Employees: ${calculateChange(previous.employees, snapshot.employees)}`);
        console.log(`   Openings: ${calculateChange(previous.jobOpenings, snapshot.jobOpenings)}`);
      }
      
      // Save history
      const fs = require('fs');
      fs.writeFileSync('company_growth_history.json', JSON.stringify(history, null, 2));
      
    } catch (error) {
      console.error('Error tracking growth:', error.message);
    }
  };
  
  // Initial check
  await checkGrowth();
  
  // Schedule periodic checks (not running in this example)
  console.log(`\n✓ Initial snapshot complete. Set up periodic checks every ${intervalDays} days for ongoing tracking.`);
  
  return history;
}

/**
 * Calculate percentage change
 */
function calculateChange(oldValue, newValue) {
  const old = parseInt((oldValue || '0').toString().replace(/[^0-9]/g, ''));
  const current = parseInt((newValue || '0').toString().replace(/[^0-9]/g, ''));
  
  if (old === 0) return `+${current}`;
  
  const change = current - old;
  const percentChange = ((change / old) * 100).toFixed(1);
  
  return change >= 0 ? `+${change} (+${percentChange}%)` : `${change} (${percentChange}%)`;
}

// Run example
if (require.main === module) {
  const companyUrl = process.argv[2] || 'https://www.linkedin.com/company/microsoft';
  
  scrapeCompanyDetails(companyUrl)
    .then(() => console.log('\n✓ Company scraping completed!'))
    .catch(error => console.error('\n✗ Scraping failed:', error.message));
}

module.exports = { scrapeCompanyDetails, trackCompanyGrowth, analyzeCompany };
