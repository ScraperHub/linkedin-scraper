// LinkedIn Scraper - Main Example
// Extract data from LinkedIn profiles, companies, and more

const { CrawlingAPI } = require('crawlbase');

// Initialize API with your token
const api = new CrawlingAPI({ token: 'YOUR_CRAWLBASE_TOKEN' });

/**
 * Scrape a LinkedIn profile
 * @param {string} profileUrl - LinkedIn profile URL
 */
async function scrapeProfile(profileUrl) {
  console.log(`Scraping profile: ${profileUrl}`);
  
  try {
    const response = await api.get(profileUrl, {
      scraper: 'linkedin-profile-scraper',
      format: 'json'
    });
    
    const profile = JSON.parse(response.body);
    
    console.log('\n=== Profile Information ===');
    console.log(`Name: ${profile.name}`);
    console.log(`Headline: ${profile.headline}`);
    console.log(`Location: ${profile.location}`);
    console.log(`Connections: ${profile.connections}`);
    
    if (profile.experience && profile.experience.length > 0) {
      console.log('\n=== Work Experience ===');
      profile.experience.slice(0, 3).forEach((exp, index) => {
        console.log(`${index + 1}. ${exp.title} at ${exp.company}`);
        console.log(`   ${exp.duration || 'Duration not specified'}`);
      });
    }
    
    if (profile.education && profile.education.length > 0) {
      console.log('\n=== Education ===');
      profile.education.forEach((edu, index) => {
        console.log(`${index + 1}. ${edu.school}`);
        if (edu.degree) console.log(`   ${edu.degree}`);
      });
    }
    
    if (profile.skills && profile.skills.length > 0) {
      console.log('\n=== Top Skills ===');
      console.log(profile.skills.slice(0, 10).join(', '));
    }
    
    return profile;
    
  } catch (error) {
    console.error('Error scraping profile:', error.message);
    throw error;
  }
}

/**
 * Scrape a LinkedIn company page
 * @param {string} companyUrl - LinkedIn company URL
 */
async function scrapeCompany(companyUrl) {
  console.log(`Scraping company: ${companyUrl}`);
  
  try {
    const response = await api.get(companyUrl, {
      scraper: 'linkedin-company-scraper',
      format: 'json'
    });
    
    const company = JSON.parse(response.body);
    
    console.log('\n=== Company Information ===');
    console.log(`Name: ${company.name}`);
    console.log(`Industry: ${company.industry}`);
    console.log(`Size: ${company.company_size}`);
    console.log(`Location: ${company.headquarters}`);
    console.log(`Followers: ${company.followers}`);
    console.log(`Employees on LinkedIn: ${company.employees_on_linkedin}`);
    
    if (company.description) {
      console.log('\n=== About ===');
      console.log(company.description.substring(0, 200) + '...');
    }
    
    return company;
    
  } catch (error) {
    console.error('Error scraping company:', error.message);
    throw error;
  }
}

/**
 * Search LinkedIn profiles by criteria
 * @param {object} criteria - Search criteria
 */
async function searchProfiles(criteria) {
  const { keywords, location, company, title } = criteria;
  
  // Build search URL
  let searchUrl = 'https://www.linkedin.com/search/results/people/?';
  if (keywords) searchUrl += `keywords=${encodeURIComponent(keywords)}&`;
  if (location) searchUrl += `geoUrn=${encodeURIComponent(location)}&`;
  if (company) searchUrl += `company=${encodeURIComponent(company)}&`;
  if (title) searchUrl += `title=${encodeURIComponent(title)}&`;
  
  console.log(`Searching profiles with criteria:`, criteria);
  
  try {
    const response = await api.get(searchUrl, {
      scraper: 'linkedin-search-scraper',
      format: 'json'
    });
    
    const results = JSON.parse(response.body);
    
    console.log(`\nFound ${results.profiles.length} profiles`);
    
    results.profiles.slice(0, 10).forEach((profile, index) => {
      console.log(`\n${index + 1}. ${profile.name}`);
      console.log(`   ${profile.headline}`);
      console.log(`   ${profile.location}`);
    });
    
    return results.profiles;
    
  } catch (error) {
    console.error('Error searching profiles:', error.message);
    throw error;
  }
}

/**
 * Scrape LinkedIn job postings
 * @param {string} jobSearchUrl - LinkedIn jobs search URL
 */
async function scrapeJobs(jobSearchUrl) {
  console.log(`Scraping jobs from: ${jobSearchUrl}`);
  
  try {
    const response = await api.get(jobSearchUrl, {
      scraper: 'linkedin-jobs-scraper',
      format: 'json'
    });
    
    const jobs = JSON.parse(response.body);
    
    console.log(`\nFound ${jobs.length} job postings`);
    
    jobs.slice(0, 10).forEach((job, index) => {
      console.log(`\n${index + 1}. ${job.title}`);
      console.log(`   Company: ${job.company}`);
      console.log(`   Location: ${job.location}`);
      console.log(`   Posted: ${job.posted_date}`);
    });
    
    return jobs;
    
  } catch (error) {
    console.error('Error scraping jobs:', error.message);
    throw error;
  }
}

/**
 * Batch scrape multiple LinkedIn profiles
 * @param {array} profileUrls - Array of LinkedIn profile URLs
 */
async function batchScrapeProfiles(profileUrls) {
  console.log(`\nBatch scraping ${profileUrls.length} profiles...`);
  
  const results = [];
  
  for (let i = 0; i < profileUrls.length; i++) {
    const url = profileUrls[i];
    console.log(`\nProcessing ${i + 1}/${profileUrls.length}: ${url}`);
    
    try {
      const profile = await scrapeProfile(url);
      results.push({
        url,
        success: true,
        data: profile
      });
      
      // Add delay to avoid rate limiting
      if (i < profileUrls.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      results.push({
        url,
        success: false,
        error: error.message
      });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  console.log(`\n✓ Successfully scraped ${successCount}/${profileUrls.length} profiles`);
  
  return results;
}

/**
 * Export scraped data to file
 * @param {any} data - Data to export
 * @param {string} filename - Output filename
 * @param {string} format - Format (json or csv)
 */
function exportData(data, filename, format = 'json') {
  const fs = require('fs');
  
  if (format === 'json') {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`\n✓ Data exported to ${filename}`);
  } else if (format === 'csv') {
    // Simple CSV export (for flat data)
    const csv = convertToCSV(data);
    fs.writeFileSync(filename, csv);
    console.log(`\n✓ Data exported to ${filename}`);
  }
}

/**
 * Convert JSON data to CSV format
 * @param {array} data - Array of objects
 */
function convertToCSV(data) {
  if (!Array.isArray(data) || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const rows = data.map(item => 
    headers.map(header => 
      JSON.stringify(item[header] || '')
    ).join(',')
  );
  
  return [headers.join(','), ...rows].join('\n');
}

// Example usage
if (require.main === module) {
  // Example profile URL
  const exampleProfile = 'https://www.linkedin.com/in/williamhgates';
  
  scrapeProfile(exampleProfile)
    .then(profile => {
      console.log('\n✓ Profile scraped successfully!');
      exportData(profile, 'profile.json');
    })
    .catch(error => {
      console.error('\n✗ Failed to scrape profile');
    });
}

module.exports = {
  scrapeProfile,
  scrapeCompany,
  searchProfiles,
  scrapeJobs,
  batchScrapeProfiles,
  exportData
};
