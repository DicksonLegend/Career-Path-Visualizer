# 🚀 Career Path Visualizer

**Plan Your Professional Journey with Interactive Skill Roadmaps**

A modern web application that generates personalized career development plans with visual skill dependency graphs, progression timelines, and curated learning resources. Built with Flask, JavaScript, and Vis.js for an engaging user experience.

![Career Path Visualizer Banner](https://img.shields.io/badge/Career-Path%20Visualizer-blue?style=for-the-badge)

---

## ✨ Features

### 🎯 **Core Functionality**
- **Interactive Skill Roadmaps**: Visual dependency graphs showing skill relationships and learning paths
- **Career Progression Timeline**: Step-by-step career advancement visualization
- **Intelligent Autocomplete**: Smart job role suggestions with fuzzy matching
- **Learning Resources**: Curated course recommendations from top platforms
- **PDF Export**: Professional roadmap documents for offline reference
- **Progress Tracking**: Save and resume your career planning journey

### 🔧 **Technical Highlights**
- **Responsive Design**: Mobile-first approach with modern CSS Grid and Flexbox
- **Real-time Visualization**: Dynamic skill graphs with vis.js network library
- **Smart Search**: Advanced role normalization and matching algorithms
- **Data-Driven**: Comprehensive skill database with 30+ career roles
- **Export Capabilities**: High-quality PDF generation with html2pdf
- **Local Storage**: Client-side progress persistence

---

## 🎨 Screenshots

### Main Interface
```
┌─────────────────────────────────────────────┐
│  🔍 Enter your dream job role...            │
│  ┌─────────────────────┐ [Generate Roadmap] │
│  │     Data Analyst    │                    │
│  └─────────────────────┘                    │
└─────────────────────────────────────────────┘
```

### Skill Roadmap Visualization
- Interactive network graph with color-coded skill categories
- Hierarchical layout showing learning dependencies
- Click-to-explore course recommendations

### Career Progression Timeline
- Visual timeline with role progression steps
- Detailed descriptions for each career level
- Skills required at each stage

---

## 🚀 Quick Start

### Prerequisites
- Python 3.7+
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/career-path-visualizer.git
   cd career-path-visualizer
   ```

2. **Install dependencies**
   ```bash
   pip install flask
   ```

3. **Run the application**
   ```bash
   python app.py
   ```

4. **Open in browser**
   ```
   http://localhost:5000
   ```

### Docker Setup (Optional)
```bash
docker build -t career-visualizer .
docker run -p 5000:5000 career-visualizer
```

---

## 📁 Project Structure

```
career-path-visualizer/
├── 📄 app.py                 # Flask application and API routes
├── 📁 templates/
│   └── 📄 index.html         # Main HTML template
├── 📁 static/
│   ├── 🎨 styles.css         # Custom CSS styling
│   ├── ⚡ script.js          # Frontend JavaScript logic
│   ├── 📦 vis.min.js         # Network visualization library
│   └── 📄 html2pdf.min.js    # PDF export functionality
├── 📁 skills_data/
│   ├── 📊 job_skills.json    # Career roles and skill definitions
│   └── 📋 courses.csv        # Learning resource database
└── 📖 README.md              # Project documentation
```

---

## 💡 Usage Guide

### 1. **Generate a Career Roadmap**
   - Enter any job role (e.g., "Data Scientist", "Full Stack Developer")
   - Use autocomplete suggestions for popular roles
   - Click "Generate Roadmap" to create your personalized plan

### 2. **Explore Skills**
   - **Skills Tab**: Interactive network showing skill dependencies
   - Click any skill node to view learning resources
   - Hover for additional skill information

### 3. **View Career Progression**
   - **Progression Tab**: Timeline of career advancement
   - See role descriptions and required skills at each level
   - Understand typical career paths in your field

### 4. **Export & Save**
   - **Save Progress**: Store locally in browser
   - **Export PDF**: Download professional roadmap document
   - Share with mentors, managers, or for personal reference

---

## 🛠️ Technology Stack

### Backend
- **Flask 2.x**: Lightweight Python web framework
- **Python 3.7+**: Core application logic and data processing

### Frontend
- **HTML5/CSS3**: Modern semantic markup and styling
- **JavaScript ES6+**: Interactive functionality and API communication
- **Vis.js 4.x**: Network visualization and graph rendering
- **html2pdf.js**: Client-side PDF generation

### Data & Storage
- **JSON**: Structured skill and career data
- **CSV**: Course and learning resource database
- **LocalStorage**: Client-side progress persistence

---

## 🎯 Supported Career Roles

### Technology
- Software Engineer, Full Stack Developer, Frontend/Backend Developer
- Data Scientist, Data Analyst, Data Engineer, ML Engineer
- DevOps Engineer, Cloud Engineer, Cybersecurity Analyst
- Mobile Developer, Game Developer, AI Engineer

### Design & Product
- UX/UI Designer, Product Designer, Graphic Designer
- Product Manager, Business Analyst, Scrum Master

### Business & Operations
- Project Manager, Marketing Manager, Sales Manager
- HR Manager, Financial Analyst, Content Manager

*...and 20+ more roles with expansion capabilities*

---

## 📊 Data Sources

### Skills Database
- **30+ Career Roles**: Comprehensive skill mappings
- **200+ Skills**: Technical and soft skills coverage
- **Dependency Mapping**: Logical skill prerequisites
- **Career Progressions**: 5-level advancement paths

### Learning Resources
- **100+ Courses**: Curated from top platforms
- **Multiple Platforms**: Coursera, Udemy, edX, YouTube, and more
- **Quality Filtering**: Reviewed and rated content
- **Regular Updates**: Fresh course recommendations

---

## 🔧 API Reference

### Get Role Suggestions
```http
GET /get-suggestions?query={role}
```
Returns autocomplete suggestions for job roles.

### Generate Roadmap
```http
POST /get-roadmap
Content-Type: application/x-www-form-urlencoded

role={job_role}
```
Returns complete career roadmap with skills, dependencies, progression, and courses.

---

## 🎨 Customization

### Adding New Career Roles
1. Edit `skills_data/job_skills.json`
2. Add role with skills, dependencies, and progression
3. Restart the application

```json
{
  "Your Custom Role": {
    "skills": ["Skill1", "Skill2", "Skill3"],
    "dependencies": {
      "Skill2": ["Skill1"],
      "Skill3": ["Skill1", "Skill2"]
    },
    "progression": [
      "Junior Your Role",
      "Your Role",
      "Senior Your Role",
      "Lead Your Role",
      "Director Your Role"
    ]
  }
}
```

### Adding Learning Resources
1. Edit `skills_data/courses.csv`
2. Add courses with skill, title, link, and platform
3. Courses automatically appear in recommendations

---

## 🚀 Deployment

### Production Setup
1. **Use a WSGI server** (Gunicorn, uWSGI)
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

2. **Environment Configuration**
   ```bash
   export FLASK_ENV=production
   export FLASK_DEBUG=False
   ```

3. **Web Server** (Nginx, Apache)
   - Serve static files directly
   - Proxy API requests to Flask

### Hosting Options
- **Heroku**: Easy deployment with git
- **AWS/GCP/Azure**: Scalable cloud hosting
- **DigitalOcean**: Simple VPS setup
- **Vercel/Netlify**: Static hosting with serverless functions

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup
```bash
# Fork and clone the repository
git clone https://github.com/yourusername/career-path-visualizer.git

# Create a feature branch
git checkout -b feature/amazing-feature

# Make your changes and test

# Commit and push
git commit -m "Add amazing feature"
git push origin feature/amazing-feature

# Open a Pull Request
```

### Contribution Guidelines
- **Code Style**: Follow PEP 8 for Python, ESLint for JavaScript
- **Testing**: Add tests for new features
- **Documentation**: Update README and inline comments
- **Data Quality**: Verify skill mappings and course links

### Areas for Contribution
- 🎯 New career roles and skill mappings
- 📚 Additional learning resources and platforms
- 🎨 UI/UX improvements and responsive design
- ⚡ Performance optimizations
- 🌐 Internationalization and localization
- 🧪 Test coverage and quality assurance

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Career Path Visualizer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 👏 Acknowledgments

### Libraries & Frameworks
- **[Flask](https://flask.palletsprojects.com/)**: Python web framework
- **[Vis.js](https://visjs.org/)**: Network visualization library
- **[html2pdf.js](https://github.com/eKoopmans/html2pdf.js)**: PDF generation
- **[Font Awesome](https://fontawesome.com/)**: Icon library

### Design Inspiration
- Modern dashboard designs from Dribbble and Behance
- Material Design principles
- Accessibility guidelines from WCAG 2.1

### Data Sources
- Industry skill requirements from job postings analysis
- Career progression patterns from LinkedIn insights
- Course recommendations from educational platform APIs

---

## 📞 Support & Contact

### Getting Help
- 📖 **Documentation**: Check this README and inline code comments
- 🐛 **Bug Reports**: Open an issue on GitHub
- 💡 **Feature Requests**: Submit enhancement proposals
- 💬 **Community**: Join our Discord server

### Contact Information
- **Email**: support@careervisualizer.com
- **Website**: https://careervisualizer.com
- **GitHub**: https://github.com/yourusername/career-path-visualizer
- **LinkedIn**: Connect with the development team

---

## 🗺️ Roadmap

### Version 2.0 (Coming Soon)
- [ ] 🔐 User authentication and profiles
- [ ] 💾 Cloud-based progress synchronization
- [ ] 🎯 Personalized skill assessments
- [ ] 📈 Progress tracking and analytics
- [ ] 🤝 Mentorship matching system

### Version 3.0 (Future)
- [ ] 🤖 AI-powered career recommendations
- [ ] 🌐 Multi-language support
- [ ] 📱 Mobile app development
- [ ] 🎓 University partnership integrations
- [ ] 🏢 Enterprise features for organizations

---

## 📊 Project Stats

![GitHub Stars](https://img.shields.io/github/stars/yourusername/career-path-visualizer?style=social)
![GitHub Forks](https://img.shields.io/github/forks/yourusername/career-path-visualizer?style=social)
![GitHub Issues](https://img.shields.io/github/issues/yourusername/career-path-visualizer)
![GitHub Pull Requests](https://img.shields.io/github/issues-pr/yourusername/career-path-visualizer)
![License](https://img.shields.io/github/license/yourusername/career-path-visualizer)

---

<div align="center">

**Made with ❤️ for career development**

[⭐ Star this project](https://github.com/yourusername/career-path-visualizer) • [🐛 Report Bug](https://github.com/yourusername/career-path-visualizer/issues) • [✨ Request Feature](https://github.com/yourusername/career-path-visualizer/issues)

</div>
