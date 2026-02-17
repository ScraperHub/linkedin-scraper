"""
LinkedIn Scraper - Python Example
Fastest & Most Reliable LinkedIn Scraper API using Crawlbase
"""

from crawlbase import CrawlingAPI
import json

# Initialize API with your token
api = CrawlingAPI({'token': 'YOUR_CRAWLBASE_TOKEN'})


def scrape_profile(profile_url: str) -> dict:
    """
    Scrape a LinkedIn profile.

    Args:
        profile_url: LinkedIn profile URL

    Returns:
        dict: Profile data
    """
    response = api.get(profile_url, {
        'scraper': 'linkedin-profile-scraper',
        'format': 'json',
        'ajax_wait': True
    })

    if response['status_code'] == 200:
        profile = json.loads(response['body'])
        print(f"Name: {profile.get('name', 'N/A')}")
        print(f"Headline: {profile.get('headline', 'N/A')}")
        print(f"Location: {profile.get('location', 'N/A')}")
        return profile
    else:
        raise Exception(f"Failed to scrape: {response['status_code']}")


def scrape_company(company_url: str) -> dict:
    """
    Scrape a LinkedIn company page.

    Args:
        company_url: LinkedIn company URL

    Returns:
        dict: Company data
    """
    response = api.get(company_url, {
        'scraper': 'linkedin-company-scraper',
        'format': 'json',
        'ajax_wait': True
    })

    if response['status_code'] == 200:
        company = json.loads(response['body'])
        print(f"Company: {company.get('name', 'N/A')}")
        print(f"Industry: {company.get('industry', 'N/A')}")
        print(f"Followers: {company.get('followers', 'N/A')}")
        return company
    else:
        raise Exception(f"Failed to scrape: {response['status_code']}")


def search_profiles(keywords: str, location: str = None) -> list:
    """
    Search LinkedIn profiles by keywords.

    Args:
        keywords: Search keywords
        location: Optional location filter

    Returns:
        list: List of matching profiles
    """
    search_url = f'https://www.linkedin.com/search/results/people/?keywords={keywords}'
    if location:
        search_url += f'&location={location}'

    response = api.get(search_url, {'scraper': 'linkedin-search-scraper', 'format': 'json'})

    if response['status_code'] == 200:
        data = json.loads(response['body'])
        profiles = data.get('profiles', [])
        print(f"Found {len(profiles)} profiles")
        return profiles
    else:
        raise Exception(f"Search failed: {response['status_code']}")


def scrape_jobs(keyword: str, location: str = '') -> list:
    """
    Scrape LinkedIn job postings.

    Args:
        keyword: Job title or keyword
        location: Job location

    Returns:
        list: List of job postings
    """
    url = f'https://www.linkedin.com/jobs/search/?keywords={keyword}&location={location}'
    response = api.get(url, {'scraper': 'linkedin-jobs-scraper', 'format': 'json'})

    if response['status_code'] == 200:
        jobs = json.loads(response['body'])
        print(f"Found {len(jobs)} job postings")
        return jobs
    else:
        raise Exception(f"Failed to scrape jobs: {response['status_code']}")


def batch_scrape_profiles(profile_urls: list) -> list:
    """
    Batch scrape multiple LinkedIn profiles.

    Args:
        profile_urls: List of LinkedIn profile URLs

    Returns:
        list: Results for each profile
    """
    results = []

    for i, url in enumerate(profile_urls, 1):
        print(f"Processing {i}/{len(profile_urls)}: {url}")
        try:
            profile = scrape_profile(url)
            results.append({'url': url, 'success': True, 'data': profile})
        except Exception as e:
            results.append({'url': url, 'success': False, 'error': str(e)})

    success_count = sum(1 for r in results if r['success'])
    print(f"\nSuccessfully scraped {success_count}/{len(profile_urls)} profiles")
    return results


def export_to_json(data: any, filename: str) -> None:
    """Save scraped data to a JSON file."""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Data saved to {filename}")


if __name__ == '__main__':
    profile_url = 'https://www.linkedin.com/in/williamhgates'

    try:
        profile = scrape_profile(profile_url)
        export_to_json(profile, 'linkedin_profile.json')
        print("Scraping completed successfully!")
    except Exception as e:
        print(f"Error: {e}")
