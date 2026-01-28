// Example: Scrape LinkedIn Profile and Extract Detailed Information

const { CrawlingAPI } = require('crawlbase');

const api = new CrawlingAPI({ token: 'YOUR_CRAWLBASE_TOKEN' });

/**
 * Scrape and analyze a LinkedIn profile
 */
async function scrapeProfileDetailed(profileUrl) {
  console.log(`Scraping LinkedIn profile: ${profileUrl}\n`);
  
  try {
    const response = await api.get(profileUrl, {
      scraper: 'linkedin-profile-scraper',
      format: 'json',
      ajax_wait: true
    });
    
    const profile = JSON.parse(response.body);
    
    // Display comprehensive profile information
    console.log('═══════════════════════════════════════');
    console.log('           PROFILE OVERVIEW            ');
    console.log('═══════════════════════════════════════');
    
    console.log(`\nName: ${profile.name}`);
    console.log(`Headline: ${profile.headline}`);
    console.log(`Location: ${profile.location}`);
    console.log(`Connections: ${profile.connections}`);
    
    if (profile.profile_url) {
      console.log(`Profile URL: ${profile.profile_url}`);
    }
    
    // About section
    if (profile.about) {
      console.log('\n═══════════════════════════════════════');
      console.log('                ABOUT                  ');
      console.log('═══════════════════════════════════════');
      console.log(profile.about);
    }
    
    // Work Experience
    if (profile.experience && profile.experience.length > 0) {
      console.log('\n═══════════════════════════════════════');
      console.log('           WORK EXPERIENCE             ');
      console.log('═══════════════════════════════════════');
      
      profile.experience.forEach((exp, index) => {
        console.log(`\n${index + 1}. ${exp.title}`);
        console.log(`   Company: ${exp.company}`);
        if (exp.duration) console.log(`   Duration: ${exp.duration}`);
        if (exp.location) console.log(`   Location: ${exp.location}`);
        if (exp.description) {
          console.log(`   Description: ${exp.description.substring(0, 150)}...`);
        }
      });
    }
    
    // Education
    if (profile.education && profile.education.length > 0) {
      console.log('\n═══════════════════════════════════════');
      console.log('              EDUCATION                ');
      console.log('═══════════════════════════════════════');
      
      profile.education.forEach((edu, index) => {
        console.log(`\n${index + 1}. ${edu.school}`);
        if (edu.degree) console.log(`   Degree: ${edu.degree}`);
        if (edu.field) console.log(`   Field of Study: ${edu.field}`);
        if (edu.dates) console.log(`   Dates: ${edu.dates}`);
      });
    }
    
    // Skills
    if (profile.skills && profile.skills.length > 0) {
      console.log('\n═══════════════════════════════════════');
      console.log('               SKILLS                  ');
      console.log('═══════════════════════════════════════');
      
      const topSkills = profile.skills.slice(0, 15);
      const rows = [];
      for (let i = 0; i < topSkills.length; i += 3) {
        rows.push(topSkills.slice(i, i + 3).join(' • '));
      }
      rows.forEach(row => console.log(row));
      
      if (profile.skills.length > 15) {
        console.log(`\n...and ${profile.skills.length - 15} more skills`);
      }
    }
    
    // Certifications
    if (profile.certifications && profile.certifications.length > 0) {
      console.log('\n═══════════════════════════════════════');
      console.log('           CERTIFICATIONS              ');
      console.log('═══════════════════════════════════════');
      
      profile.certifications.forEach((cert, index) => {
        console.log(`\n${index + 1}. ${cert.name}`);
        if (cert.issuer) console.log(`   Issued by: ${cert.issuer}`);
        if (cert.date) console.log(`   Date: ${cert.date}`);
      });
    }
    
    // Languages
    if (profile.languages && profile.languages.length > 0) {
      console.log('\n═══════════════════════════════════════');
      console.log('              LANGUAGES                ');
      console.log('═══════════════════════════════════════');
      
      profile.languages.forEach(lang => {
        console.log(`• ${lang.name}${lang.proficiency ? ' - ' + lang.proficiency : ''}`);
      });
    }
    
    // Generate profile summary
    console.log('\n═══════════════════════════════════════');
    console.log('           PROFILE SUMMARY             ');
    console.log('═══════════════════════════════════════');
    
    const summary = {
      totalExperience: profile.experience?.length || 0,
      totalEducation: profile.education?.length || 0,
      totalSkills: profile.skills?.length || 0,
      hasCertifications: (profile.certifications?.length || 0) > 0,
      connectionLevel: categorizeConnections(profile.connections)
    };
    
    console.log(`Experience Entries: ${summary.totalExperience}`);
    console.log(`Education Entries: ${summary.totalEducation}`);
    console.log(`Skills Listed: ${summary.totalSkills}`);
    console.log(`Certifications: ${summary.hasCertifications ? 'Yes' : 'No'}`);
    console.log(`Connection Level: ${summary.connectionLevel}`);
    
    // Save to file
    const fs = require('fs');
    const timestamp = Date.now();
    const filename = `linkedin_profile_${timestamp}.json`;
    fs.writeFileSync(filename, JSON.stringify(profile, null, 2));
    
    console.log(`\n✓ Full profile data saved to ${filename}`);
    
    return profile;
    
  } catch (error) {
    console.error('Error scraping profile:', error.message);
    throw error;
  }
}

/**
 * Categorize connection count
 */
function categorizeConnections(connections) {
  if (!connections) return 'Unknown';
  
  const count = parseInt(connections.replace(/[^0-9]/g, ''));
  
  if (connections.includes('500+')) return 'Highly Connected (500+)';
  if (count >= 200) return 'Well Connected (200-499)';
  if (count >= 50) return 'Moderately Connected (50-199)';
  return 'Building Network (<50)';
}

/**
 * Compare multiple profiles
 */
async function compareProfiles(profileUrls) {
  console.log(`Comparing ${profileUrls.length} LinkedIn profiles...\n`);
  
  const profiles = [];
  
  for (const url of profileUrls) {
    try {
      const profile = await scrapeProfileDetailed(url);
      profiles.push(profile);
      console.log('\n---\n');
    } catch (error) {
      console.error(`Failed to scrape ${url}:`, error.message);
    }
  }
  
  // Comparison summary
  console.log('═══════════════════════════════════════');
  console.log('         PROFILE COMPARISON            ');
  console.log('═══════════════════════════════════════\n');
  
  profiles.forEach((profile, index) => {
    console.log(`${index + 1}. ${profile.name}`);
    console.log(`   Experience: ${profile.experience?.length || 0} positions`);
    console.log(`   Skills: ${profile.skills?.length || 0} listed`);
    console.log(`   Connections: ${profile.connections}\n`);
  });
  
  return profiles;
}

// Run example
if (require.main === module) {
  const profileUrl = process.argv[2] || 'https://www.linkedin.com/in/williamhgates';
  
  scrapeProfileDetailed(profileUrl)
    .then(() => console.log('\n✓ Profile scraping completed!'))
    .catch(error => console.error('\n✗ Scraping failed:', error.message));
}

module.exports = { scrapeProfileDetailed, compareProfiles };
