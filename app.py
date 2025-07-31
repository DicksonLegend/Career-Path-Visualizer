from flask import Flask, render_template, request, jsonify
import csv
import json
import re
from collections import Counter
import os

app = Flask(__name__)

# Load job skills data
try:
    with open('skills_data/job_skills.json', 'r', encoding='utf-8') as f:
        job_skills_data = json.load(f)
except Exception as e:
    print(f"Error loading job skills data: {e}")
    job_skills_data = {}

# Load courses data
courses = []
try:
    with open('skills_data/courses.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Ensure all required fields exist and are not None
            if row and all(key in row and row[key] for key in ['skill', 'course_title', 'platform']):
                courses.append(row)
except Exception as e:
    print(f"Error loading courses data: {e}")
    courses = []

# Function to normalize role names for better matching
def normalize_role(role_str):
    if not role_str or not isinstance(role_str, str):
        return ""
    
    # Convert to lowercase and strip whitespace
    normalized = role_str.lower().strip()
    
    # Replace common variations
    normalized = normalized.replace("fullstack", "full stack")
    normalized = normalized.replace("full-stack", "full stack")
    normalized = normalized.replace("frontend", "front end")
    normalized = normalized.replace("front-end", "front end")
    normalized = normalized.replace("backend", "back end")
    normalized = normalized.replace("back-end", "back end")
    normalized = normalized.replace("ui ux", "ui/ux")
    normalized = normalized.replace("ui/ux", "ui/ux")
    
    return normalized

# Enhanced skill extraction with better dependencies
def extract_skills_from_title(job_title):
    try:
        if not job_title or not isinstance(job_title, str):
            job_title = "Generic Role"
            
        # Comprehensive skill mapping with categories
        skill_categories = {
            'Programming': {
                'keywords': ['programming', 'developer', 'engineer', 'software', 'coding'],
                'skills': ['Python', 'Java', 'JavaScript', 'C++', 'C#', 'PHP', 'Ruby', 'Swift', 'Go', 'Rust', 'TypeScript']
            },
            'Web Development': {
                'keywords': ['web', 'frontend', 'backend', 'fullstack', 'full stack'],
                'skills': ['HTML', 'CSS', 'JavaScript', 'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'Django', 'Flask']
            },
            'Data Science': {
                'keywords': ['data', 'analytics', 'analyst', 'scientist', 'machine learning', 'ai'],
                'skills': ['SQL', 'Python', 'R', 'Excel', 'Tableau', 'Power BI', 'Statistics', 'Machine Learning', 'Deep Learning']
            },
            'Mobile Development': {
                'keywords': ['mobile', 'ios', 'android', 'app'],
                'skills': ['Swift', 'Kotlin', 'React Native', 'Flutter', 'Java', 'Objective-C']
            },
            'Cloud & DevOps': {
                'keywords': ['cloud', 'devops', 'aws', 'azure', 'infrastructure'],
                'skills': ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform']
            },
            'Database': {
                'keywords': ['database', 'db', 'sql', 'nosql'],
                'skills': ['SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Oracle', 'Redis']
            },
            'Design': {
                'keywords': ['design', 'ui', 'ux', 'graphic', 'visual'],
                'skills': ['Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'UI Design', 'UX Design']
            },
            'Management': {
                'keywords': ['manager', 'management', 'lead', 'director', 'head'],
                'skills': ['Leadership', 'Project Management', 'Agile', 'Scrum', 'Communication', 'Team Management']
            },
            'Marketing': {
                'keywords': ['marketing', 'digital', 'seo', 'content', 'social media'],
                'skills': ['SEO', 'SEM', 'Google Analytics', 'Content Marketing', 'Social Media Marketing', 'Email Marketing']
            },
            'Security': {
                'keywords': ['security', 'cyber', 'hacking', 'penetration'],
                'skills': ['Network Security', 'Cryptography', 'Ethical Hacking', 'Penetration Testing', 'Firewalls']
            },
            'AI & ML': {
                'keywords': ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'ml'],
                'skills': ['Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Neural Networks', 'AI']
            },
            'Data Engineering': {
                'keywords': ['data engineering', 'etl', 'pipeline', 'warehousing'],
                'skills': ['ETL', 'Data Warehousing', 'Big Data', 'Spark', 'Hadoop', 'Data Pipeline']
            },
            'Blockchain': {
                'keywords': ['blockchain', 'cryptocurrency', 'smart contract', 'web3'],
                'skills': ['Blockchain', 'Smart Contracts', 'Solidity', 'Web3', 'Cryptocurrency']
            },
            'Game Development': {
                'keywords': ['game', 'unity', 'unreal', 'gaming'],
                'skills': ['Unity', 'Unreal Engine', 'Game Design', 'C#', 'C++', '3D Modeling']
            },
            'IoT': {
                'keywords': ['iot', 'internet of things', 'embedded', 'sensor'],
                'skills': ['IoT', 'Arduino', 'Raspberry Pi', 'Embedded Systems', 'Sensor Networks']
            },
            'Cybersecurity': {
                'keywords': ['cybersecurity', 'security', 'ethical hacking', 'penetration testing'],
                'skills': ['Cybersecurity', 'Network Security', 'Ethical Hacking', 'Penetration Testing', 'Cryptography']
            },
            'Cloud Computing': {
                'keywords': ['cloud computing', 'cloud', 'aws', 'azure', 'gcp'],
                'skills': ['AWS', 'Azure', 'Google Cloud', 'Cloud Architecture', 'Serverless', 'Cloud Migration']
            }
        }
        
        # Common skills for all roles
        common_skills = ['Communication', 'Problem Solving', 'Teamwork', 'Time Management']
        
        # Convert job title to lowercase for matching
        title_lower = job_title.lower() if job_title else ""
        
        # Extract skills based on keywords in the job title
        matched_skills = set(common_skills)  # Start with common skills
        
        # Match categories and their skills
        for category, data in skill_categories.items():
            try:
                # Check if any category keyword is in the job title
                if any(keyword and keyword in title_lower for keyword in data.get('keywords', [])):
                    matched_skills.update(skill for skill in data.get('skills', []) if skill)
                
                # Check if individual skills are in the job title
                for skill in data.get('skills', []):
                    if skill and isinstance(skill, str) and skill.lower() in title_lower:
                        matched_skills.add(skill)
            except Exception as e:
                print(f"Error processing category {category}: {e}")
                continue
        
        # Generate logical dependencies
        dependencies = {}
        
        # Define skill hierarchy
        skill_hierarchy = {
            'Programming': ['Communication', 'Problem Solving'],
            'Web Development': ['Programming', 'Communication'],
            'Data Science': ['Programming', 'Statistics', 'Communication'],
            'Mobile Development': ['Programming', 'Communication'],
            'Cloud & DevOps': ['Programming', 'Linux', 'Communication'],
            'Database': ['Programming', 'Communication'],
            'Design': ['Communication', 'Problem Solving'],
            'Management': ['Communication', 'Problem Solving', 'Teamwork'],
            'Marketing': ['Communication', 'Problem Solving'],
            'Security': ['Programming', 'Communication', 'Problem Solving'],
            'AI & ML': ['Programming', 'Mathematics', 'Communication'],
            'Data Engineering': ['Programming', 'Database', 'Communication'],
            'Blockchain': ['Programming', 'Cryptography', 'Communication'],
            'Game Development': ['Programming', 'Design', 'Communication'],
            'IoT': ['Programming', 'Hardware', 'Communication'],
            'Cybersecurity': ['Networking', 'Programming', 'Communication'],
            'Cloud Computing': ['Networking', 'Programming', 'Communication']
        }
        
        # Filter out None values from matched_skills
        matched_skills = {skill for skill in matched_skills if skill and isinstance(skill, str)}
        
        # Assign dependencies based on skill categories
        for skill in matched_skills:
            if not skill or not isinstance(skill, str):
                continue
                
            if skill in common_skills:
                dependencies[skill] = []
            else:
                # Find which category this skill belongs to
                skill_found = False
                for category, data in skill_categories.items():
                    if skill in data.get('skills', []):
                        # Get prerequisites from hierarchy, but filter to only include skills in matched_skills
                        prereqs = skill_hierarchy.get(category, [])
                        dependencies[skill] = [prereq for prereq in prereqs if prereq and prereq in matched_skills]
                        skill_found = True
                        break
                
                if not skill_found:
                    # If skill not found in categories, assign basic dependencies
                    dependencies[skill] = [s for s in ['Communication', 'Problem Solving'] if s and s in matched_skills]
        
        # Generate career progression
        progression = [
            f"Junior {job_title}",
            job_title,
            f"Senior {job_title}",
            f"Lead {job_title}",
            f"Manager/Director of {job_title.split(' ')[0] if job_title and ' ' in job_title else 'Technology'}"
        ]
        
        return {
            'skills': [skill for skill in matched_skills if skill and isinstance(skill, str)],
            'dependencies': dependencies,
            'progression': progression
        }
        
    except Exception as e:
        print(f"Error in extract_skills_from_title: {e}")
        # Return a safe default
        return {
            'skills': ['Communication', 'Problem Solving', 'Teamwork'],
            'dependencies': {
                'Communication': [],
                'Problem Solving': [],
                'Teamwork': ['Communication']
            },
            'progression': [f"Junior {job_title}", job_title, f"Senior {job_title}", f"Lead {job_title}", "Manager"]
        }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get-suggestions', methods=['GET'])
def get_suggestions():
    query = request.args.get('query', '').lower()
    suggestions = []
    
    if len(query) < 1:
        return jsonify([])
    
    # Normalize the query for better matching
    normalized_query = normalize_role(query)
    
    # Get all job roles from job_skills_data
    for role in job_skills_data.keys():
        if role and isinstance(role, str):
            normalized_role = normalize_role(role)
            if normalized_query and normalized_query in normalized_role:
                suggestions.append(role)
    
    # Add common job roles if not already included
    common_roles = [
        "Software Engineer", "Frontend Developer", "Backend Developer", 
        "Full Stack Developer", "Fullstack Developer", "Mobile Developer", "Data Engineer",
        "Machine Learning Engineer", "Business Analyst", "Product Manager",
        "Project Manager", "Marketing Manager", "UX Designer",
        "DevOps Engineer", "Cloud Engineer", "Security Analyst",
        "Database Administrator", "Network Engineer", "Game Developer",
        "AI Engineer", "Blockchain Developer", "IoT Developer",
        "QA Engineer", "Systems Administrator", "Technical Writer",
        "Data Scientist", "Data Analyst", "UI Designer",
        "Graphic Designer", "Product Designer", "Research Scientist",
        "MLOps Engineer", "Solutions Architect", "Scrum Master",
        "BI Developer", "Data Visualization Specialist", "HR Manager",
        "Financial Analyst", "Content Manager", "Sales Manager",
        "Cybersecurity Analyst", "Technical Writer", "DevRel Engineer"
    ]
    
    for role in common_roles:
        if role and isinstance(role, str):
            normalized_role = normalize_role(role)
            if normalized_query and normalized_query in normalized_role and role not in suggestions:
                suggestions.append(role)
    
    # Filter out None values and ensure all suggestions are strings
    suggestions = [s for s in suggestions if s is not None and isinstance(s, str)]
    
    # Sort suggestions by relevance
    exact_matches = []
    starts_with = []
    contains = []
    
    for s in suggestions:
        normalized_s = normalize_role(s)
        if normalized_s == normalized_query:
            exact_matches.append(s)
        elif normalized_s.startswith(normalized_query):
            starts_with.append(s)
        elif normalized_query in normalized_s:
            contains.append(s)
    
    sorted_suggestions = exact_matches + starts_with + contains
    
    return jsonify(sorted_suggestions[:10])  # Return top 10 suggestions

@app.route('/get-roadmap', methods=['POST'])
def get_roadmap():
    try:
        role = request.form.get('role', '').strip()
        print(f"Received role request: '{role}'")
        
        if not role:
            return jsonify({'error': 'Please enter a job role'})
        
        # Normalize the input role for better matching
        normalized_role = normalize_role(role)
        print(f"Normalized role: '{normalized_role}'")
        print(f"Available roles in job_skills_data: {list(job_skills_data.keys())}")
        
        # Check if we have predefined data for this role
        predefined_data = None
        
        # Check for exact match first
        for job_role, data in job_skills_data.items():
            if job_role and isinstance(job_role, str):
                normalized_job_role = normalize_role(job_role)
                if normalized_role == normalized_job_role:
                    predefined_data = data
                    print(f"Found exact predefined data for: {job_role}")
                    break
        
        # If no exact match, try partial match
        if not predefined_data:
            for job_role, data in job_skills_data.items():
                if job_role and isinstance(job_role, str):
                    normalized_job_role = normalize_role(job_role)
                    if normalized_role in normalized_job_role or normalized_job_role in normalized_role:
                        predefined_data = data
                        print(f"Found partial predefined data for: {job_role}")
                        break
        
        if predefined_data:
            # Use predefined data
            print(f"Using predefined data for role: {role}")
            role_data = predefined_data
            
            # Validate predefined data structure
            if not isinstance(role_data, dict):
                print(f"Invalid role_data structure: {type(role_data)}")
                role_data = extract_skills_from_title(role)
            
            # Ensure required fields exist
            if 'skills' not in role_data or not role_data['skills']:
                print("No skills in predefined data, extracting dynamically")
                role_data = extract_skills_from_title(role)
                
        else:
            # Extract skills dynamically
            print(f"Extracting skills dynamically for role: {role}")
            role_data = extract_skills_from_title(role)
        
        print(f"Final role_data keys: {role_data.keys() if isinstance(role_data, dict) else 'Not a dict'}")
        
        # Ensure all required fields exist
        if 'skills' not in role_data or not role_data['skills']:
            return jsonify({'error': 'No skills found for this role'})
        
        if 'dependencies' not in role_data:
            role_data['dependencies'] = {}
        
        if 'progression' not in role_data:
            role_data['progression'] = [
                f"Junior {role}",
                role,
                f"Senior {role}",
                f"Lead {role}",
                f"Manager/Director"
            ]
        
        print(f"Role data validated. Skills count: {len(role_data['skills'])}")
        
        # Get courses for each skill
        skill_courses = {}
        for skill in role_data['skills']:
            if skill and isinstance(skill, str):  # Ensure skill is not None or empty
                # Find courses for this skill (case-insensitive)
                matching_courses = []
                for course in courses:
                    try:
                        if (course and 
                            isinstance(course, dict) and 
                            'skill' in course and 
                            course['skill'] and 
                            isinstance(course['skill'], str) and
                            isinstance(skill, str)):
                            
                            course_skill = course['skill'].lower()
                            skill_lower = skill.lower()
                            
                            if skill_lower in course_skill or course_skill in skill_lower:
                                matching_courses.append(course)
                    except Exception as course_error:
                        print(f"Error processing course: {course_error}")
                        continue
                
                skill_courses[skill] = matching_courses
        
        print(f"Course matching complete. Total skills with courses: {len(skill_courses)}")
        
        response_data = {
            'role': role,
            'skills': role_data['skills'],
            'dependencies': role_data['dependencies'],
            'progression': role_data['progression'],
            'courses': skill_courses
        }
        
        print(f"Returning response with {len(response_data['skills'])} skills")
        return jsonify(response_data)
        
    except Exception as e:
        print(f"Error generating roadmap: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'An error occurred while generating the roadmap: {str(e)}'})

if __name__ == '__main__':
    app.run(debug=True)