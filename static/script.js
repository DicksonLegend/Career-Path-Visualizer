document.addEventListener('DOMContentLoaded', function() {
    const roleInput = document.getElementById('role');
    const suggestionsDropdown = document.getElementById('suggestions-dropdown');
    const roleForm = document.getElementById('role-form');
    const roadmapContainer = document.getElementById('roadmap-container');
    const roleTitle = document.getElementById('role-title');
    const skillGraph = document.getElementById('skill-graph');
    const skillInfo = document.getElementById('skill-info');
    const coursesModal = document.getElementById('courses-modal');
    const coursesList = document.getElementById('courses-list');
    const saveBtn = document.getElementById('save-btn');
    const exportBtn = document.getElementById('export-btn');
    const closeCoursesBtn = document.getElementById('close-courses');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    let network;
    let roadmapData = null;
    let currentFocus = -1;
    
    // Autocomplete functionality
    roleInput.addEventListener('input', function() {
        const query = this.value.trim();
        
        if (query.length < 1) {
            suggestionsDropdown.innerHTML = '';
            suggestionsDropdown.classList.remove('show');
            return;
        }
        
        fetch(`/get-suggestions?query=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(suggestions => {
                if (suggestions.length > 0) {
                    suggestionsDropdown.innerHTML = '';
                    suggestions.forEach((suggestion, index) => {
                        const item = document.createElement('div');
                        item.className = 'suggestion-item';
                        
                        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                        const highlightedText = suggestion.replace(regex, '<strong>$1</strong>');
                        item.innerHTML = highlightedText;
                        
                        item.addEventListener('click', function() {
                            roleInput.value = suggestion;
                            suggestionsDropdown.classList.remove('show');
                            currentFocus = -1;
                        });
                        
                        suggestionsDropdown.appendChild(item);
                    });
                    suggestionsDropdown.classList.add('show');
                    currentFocus = -1;
                } else {
                    suggestionsDropdown.innerHTML = '';
                    suggestionsDropdown.classList.remove('show');
                }
            })
            .catch(error => {
                console.error('Error fetching suggestions:', error);
            });
    });
    
    // Keyboard navigation for autocomplete
    roleInput.addEventListener('keydown', function(e) {
        const items = suggestionsDropdown.getElementsByClassName('suggestion-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentFocus++;
            if (currentFocus >= items.length) currentFocus = 0;
            setActive(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentFocus--;
            if (currentFocus < 0) currentFocus = items.length - 1;
            setActive(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentFocus > -1 && items[currentFocus]) {
                items[currentFocus].click();
            } else {
                roleForm.dispatchEvent(new Event('submit'));
            }
        } else if (e.key === 'Escape') {
            suggestionsDropdown.classList.remove('show');
        }
    });
    
    function setActive(items) {
        if (!items) return;
        removeActive(items);
        if (currentFocus >= 0 && currentFocus < items.length) {
            items[currentFocus].classList.add('selected');
        }
    }
    
    function removeActive(items) {
        for (let i = 0; i < items.length; i++) {
            items[i].classList.remove('selected');
        }
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target !== roleInput && e.target !== suggestionsDropdown) {
            suggestionsDropdown.classList.remove('show');
        }
    });
    
    // Handle form submission
    roleForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const role = roleInput.value.trim();
        
        if (!role) {
            showNotification('Please enter a job role', 'error');
            return;
        }
        
        const submitBtn = roleForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        submitBtn.disabled = true;
        
        fetch('/get-roadmap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `role=${encodeURIComponent(role)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showNotification(data.error, 'error');
                return;
            }
            
            // Validate data structure
            if (!data.skills || !Array.isArray(data.skills) || data.skills.length === 0) {
                showNotification('No skills data found for this role.', 'error');
                return;
            }
            
            if (!data.dependencies || typeof data.dependencies !== 'object') {
                data.dependencies = {};
            }
            
            if (!data.progression || !Array.isArray(data.progression)) {
                data.progression = ['Entry Level', 'Mid Level', 'Senior Level', 'Lead Level', 'Management'];
            }
            
            roadmapData = data;
            roleTitle.textContent = `Career Path: ${data.role}`;
            roadmapContainer.classList.remove('hidden');
            
            roadmapContainer.scrollIntoView({ behavior: 'smooth' });
            
            try {
                renderSkillGraph(data.skills, data.dependencies);
                renderProgressionTimeline(data.progression);
                showNotification('Roadmap generated successfully!', 'success');
            } catch (renderError) {
                console.error('Rendering error:', renderError);
                showNotification('Error displaying the roadmap. Please try again.', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('An error occurred while fetching the roadmap.', 'error');
        })
        .finally(() => {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        });
    });
    
    // Tab navigation
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-tab`) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // Render skill dependency graph with enhanced visualization
    function renderSkillGraph(skills, dependencies) {
        // Define categories and colors for skills
        const categories = {
            'Programming': { color: '#3498db', icon: 'fa-code', level: 1 },
            'Web Development': { color: '#2ecc71', icon: 'fa-globe', level: 1 },
            'Data Science': { color: '#9b59b6', icon: 'fa-chart-bar', level: 1 },
            'Database': { color: '#e67e22', icon: 'fa-database', level: 2 },
            'Cloud & DevOps': { color: '#1abc9c', icon: 'fa-cloud', level: 2 },
            'Design': { color: '#e74c3c', icon: 'fa-paint-brush', level: 1 },
            'Management': { color: '#f39c12', icon: 'fa-users', level: 3 },
            'Marketing': { color: '#d35400', icon: 'fa-bullhorn', level: 1 },
            'Security': { color: '#34495e', icon: 'fa-shield-alt', level: 2 },
            'Common': { color: '#95a5a6', icon: 'fa-star', level: 0 }
        };
        
        // Assign categories to skills
        const skillCategories = {};
        const skillLevels = {};
        
        skills.forEach(skill => {
            if (['Python', 'Java', 'JavaScript', 'C++', 'C#', 'PHP', 'Ruby', 'Swift', 'Go', 'Rust', 'TypeScript'].includes(skill)) {
                skillCategories[skill] = 'Programming';
            } else if (['HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'Django', 'Flask'].includes(skill)) {
                skillCategories[skill] = 'Web Development';
            } else if (['SQL', 'R', 'Excel', 'Tableau', 'Power BI', 'Statistics', 'Machine Learning', 'Deep Learning'].includes(skill)) {
                skillCategories[skill] = 'Data Science';
            } else if (['MongoDB', 'PostgreSQL', 'MySQL', 'Oracle', 'NoSQL', 'Redis'].includes(skill)) {
                skillCategories[skill] = 'Database';
            } else if (['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Terraform'].includes(skill)) {
                skillCategories[skill] = 'Cloud & DevOps';
            } else if (['Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator', 'UI Design', 'UX Design'].includes(skill)) {
                skillCategories[skill] = 'Design';
            } else if (['Leadership', 'Project Management', 'Agile', 'Scrum', 'Team Management'].includes(skill)) {
                skillCategories[skill] = 'Management';
            } else if (['SEO', 'SEM', 'Google Analytics', 'Content Marketing', 'Social Media Marketing'].includes(skill)) {
                skillCategories[skill] = 'Marketing';
            } else if (['Network Security', 'Cryptography', 'Ethical Hacking', 'Penetration Testing'].includes(skill)) {
                skillCategories[skill] = 'Security';
            } else {
                skillCategories[skill] = 'Common';
            }
            
            // Assign level based on category
            skillLevels[skill] = categories[skillCategories[skill]].level;
        });
        
        // Create nodes with enhanced properties
        const nodes = new vis.DataSet(
            skills.map(skill => {
                const category = skillCategories[skill] || 'Common';
                const categoryInfo = categories[category];
                const level = skillLevels[skill] || 0;
                
                // Determine node size based on skill level
                const size = 35 + (level * 12);
                
                return {
                    id: skill,
                    label: skill,
                    color: {
                        background: categoryInfo.color,
                        border: darkenColor(categoryInfo.color, 20),
                        highlight: {
                            background: lightenColor(categoryInfo.color, 20),
                            border: categoryInfo.color
                        }
                    },
                    font: { 
                        color: 'white', 
                        size: 14, 
                        face: 'Inter',
                        bold: true,
                        strokeColor: 'transparent',
                        strokeWidth: 0
                    },
                    shape: 'box',
                    margin: 12,
                    borderWidth: 3,
                    borderColor: darkenColor(categoryInfo.color, 30),
                    shadow: true,
                    shadowColor: 'rgba(0, 0, 0, 0.2)',
                    shadowSize: 10,
                    shadowX: 3,
                    shadowY: 3,
                    category: category,
                    icon: categoryInfo.icon,
                    level: level,
                    size: size
                };
            })
        );
        
        // Create edges with enhanced properties
        const edges = [];
        for (const [skill, deps] of Object.entries(dependencies)) {
            deps.forEach(dep => {
                edges.push({
                    from: dep,
                    to: skill,
                    arrows: {
                        to: {
                            enabled: true,
                            scaleFactor: 1.2,
                            type: 'arrow'
                        }
                    },
                    color: {
                        color: '#adb5bd',
                        highlight: '#4361ee',
                        opacity: 0.8
                    },
                    width: 3,
                    smooth: {
                        type: 'curvedCW',
                        roundness: 0.3
                    },
                    physics: false,
                    shadow: {
                        enabled: true,
                        color: 'rgba(0, 0, 0, 0.1)',
                        size: 5,
                        x: 2,
                        y: 2
                    }
                });
            });
        }
        
        const data = {
            nodes: nodes,
            edges: new vis.DataSet(edges)
        };
        
        // Enhanced options for better visualization
        const options = {
            layout: {
                hierarchical: {
                    direction: 'UD',
                    sortMethod: 'directed',
                    levelSeparation: 250,
                    nodeSpacing: 300,
                    treeSpacing: 200,
                    blockShifting: true,
                    edgeMinimization: true,
                    parentCentralization: true,
                    shakeTowards: 'leaves'
                }
            },
            physics: {
                enabled: false
            },
            interaction: {
                hover: true,
                tooltipDelay: 200,
                zoomView: true,
                dragView: true
            },
            nodes: {
                borderWidth: 3,
                shadow: true,
                shapeProperties: {
                    borderRadius: 8
                },
                chosen: {
                    node: function(values, id, selected, hovering) {
                        values.shadowSize = 15;
                        values.shadowX = 5;
                        values.shadowY = 5;
                    }
                }
            },
            edges: {
                shadow: true,
                smooth: {
                    forceDirection: 'none'
                },
                chosen: {
                    edge: function(values, id, selected, hovering) {
                        values.width = 5;
                        values.color = '#4361ee';
                        values.shadow = true;
                        values.shadowSize = 8;
                        values.shadowColor = 'rgba(67, 97, 238, 0.3)';
                    }
                }
            }
        };
        
        // Create network
        network = new vis.Network(skillGraph, data, options);
        
        // Handle node click to show skill details
        network.on("click", function(params) {
            if (params.nodes.length > 0) {
                const skill = params.nodes[0];
                showSkillDetails(skill);
            }
        });
        
        // Handle stabilization
        network.once('stabilizationIterationsDone', function() {
            network.setOptions({ physics: false });
        });
        
        // Fit the network to the container
        network.fit();
        
        // Add a subtle animation on load
        setTimeout(() => {
            network.focus(0, {
                scale: 0.9,
                animation: {
                    duration: 1000,
                    easingFunction: 'easeInOutQuad'
                }
            });
        }, 300);
    }
    
    // Show skill details
    function showSkillDetails(skill) {
        if (!roadmapData) return;
        
        const category = network.body.nodes[skill].options.category;
        const icon = network.body.nodes[skill].options.icon;
        const courses = roadmapData.courses[skill] || [];
        
        skillInfo.innerHTML = `
            <div class="skill-info-header">
                <h4>${skill}</h4>
                <span class="skill-category">
                    <i class="fas ${icon}"></i> ${category}
                </span>
            </div>
            <div class="skill-info-body">
                <div class="skill-description">
                    <p>${getSkillDescription(skill)}</p>
                </div>
                <div class="skill-courses">
                    <h5>Learning Resources (${courses.length})</h5>
                    ${courses.length > 0 ? courses.map(course => `
                        <div class="course-preview" onclick="showCourses('${skill}')">
                            <i class="fas fa-play-circle"></i>
                            <div>
                                <div>${course.course_title}</div>
                                <div class="course-platform">${course.platform}</div>
                            </div>
                        </div>
                    `).join('') : `
                        <p>No courses found in our database for this skill.</p>
                        <button class="btn btn-primary" onclick="showCourses('${skill}')">
                            <i class="fas fa-search"></i> Find Resources
                        </button>
                    `}
                </div>
            </div>
        `;
    }
    
    // Get skill description
    function getSkillDescription(skill) {
        const descriptions = {
            'Python': 'A versatile programming language used for web development, data analysis, artificial intelligence, and more.',
            'SQL': 'A domain-specific language used in programming and designed for managing data held in a relational database.',
            'JavaScript': 'A programming language that enables interactive web pages and is an essential part of web applications.',
            'HTML': 'The standard markup language for documents designed to be displayed in a web browser.',
            'CSS': 'A style sheet language used for describing the presentation of a document written in HTML.',
            'React': 'A JavaScript library for building user interfaces, particularly single-page applications.',
            'Node.js': 'A JavaScript runtime built on Chrome\'s V8 JavaScript engine for building server-side and networking applications.',
            'Excel': 'A spreadsheet program used to store, organize, and analyze data.',
            'Tableau': 'A data visualization tool that is used for data science and business intelligence.',
            'Communication': 'The ability to convey information effectively and efficiently.',
            'Problem Solving': 'The process of finding solutions to complex issues.',
            'Machine Learning': 'A subset of artificial intelligence that enables systems to learn and improve from experience.',
            'AWS': 'Amazon Web Services, a comprehensive cloud computing platform.',
            'Docker': 'A platform for developing, shipping, and running applications in containers.',
            'Figma': 'A collaborative web application for interface design.',
            'Leadership': 'The ability to guide, motivate, and inspire a group of people toward a common goal.'
        };
        
        return descriptions[skill] || `${skill} is an important skill for your career development. Mastering this skill will open up new opportunities and enhance your professional growth.`;
    }
    
    // Render career progression timeline
    function renderProgressionTimeline(progression) {
        const timeline = document.querySelector('.timeline');
        timeline.innerHTML = '';
        
        progression.forEach((role, index) => {
            const isCurrent = index === 1; // Second position is considered current
            const isStart = index === 0;
            const isGoal = index === progression.length - 1;
            
            const timelineItem = document.createElement('div');
            timelineItem.className = `timeline-item ${isCurrent ? 'current' : ''}`;
            
            // Get icon based on role
            let icon = 'fa-briefcase';
            if (role.toLowerCase().includes('manager') || role.toLowerCase().includes('director')) {
                icon = 'fa-user-tie';
            } else if (role.toLowerCase().includes('senior')) {
                icon = 'fa-star';
            } else if (role.toLowerCase().includes('junior')) {
                icon = 'fa-seedling';
            }
            
            timelineItem.innerHTML = `
                <div class="timeline-content">
                    <h4><i class="fas ${icon}"></i> ${role}</h4>
                    ${isStart ? '<span class="timeline-position">Starting Point</span>' : ''}
                    ${isGoal ? '<span class="timeline-position">Goal Position</span>' : ''}
                    ${isCurrent ? '<span class="timeline-position">Current Position</span>' : ''}
                    <p>${getRoleDescription(role)}</p>
                    <div class="timeline-skills">
                        ${getRoleSkills(role).map(skill => `<span>${skill}</span>`).join('')}
                    </div>
                </div>
            `;
            
            timeline.appendChild(timelineItem);
        });
    }
    
    // Get role description
    function getRoleDescription(role) {
        const descriptions = {
            'Junior Data Analyst': 'Entry-level position focusing on data collection, cleaning, and basic analysis.',
            'Data Analyst': 'Mid-level position responsible for interpreting data and providing insights to drive business decisions.',
            'Senior Data Analyst': 'Experienced position leading complex analysis projects and mentoring junior analysts.',
            'Data Scientist': 'Advanced role involving statistical analysis, machine learning, and predictive modeling.',
            'Data Science Manager': 'Leadership position overseeing data science teams and strategic initiatives.',
            'Junior Web Developer': 'Entry-level position focusing on website development and maintenance.',
            'Web Developer': 'Mid-level position responsible for building and maintaining websites and web applications.',
            'Senior Web Developer': 'Experienced position leading development projects and mentoring junior developers.',
            'Full Stack Developer': 'Role involving both front-end and back-end development.',
            'Lead Developer': 'Leadership position overseeing development teams and technical strategy.',
            'UX Designer': 'Professional focused on enhancing user satisfaction by improving the usability and accessibility of products.',
            'Product Manager': 'Professional who leads the development of products from conception to launch.',
            'DevOps Engineer': 'Professional who combines software development and IT operations to shorten the development lifecycle.'
        };
        
        return descriptions[role] || `A professional position in your career path focusing on ${role.toLowerCase()} responsibilities and growth opportunities.`;
    }
    
    // Get role skills
    function getRoleSkills(role) {
        const roleSkills = {
            'Junior Data Analyst': ['Excel', 'SQL', 'Basic Statistics'],
            'Data Analyst': ['SQL', 'Python', 'Data Visualization', 'Statistics'],
            'Senior Data Analyst': ['Advanced SQL', 'Python', 'Machine Learning', 'Communication'],
            'Data Scientist': ['Python', 'Machine Learning', 'Statistics', 'Big Data'],
            'Data Science Manager': ['Leadership', 'Strategy', 'Communication', 'Team Management'],
            'Junior Web Developer': ['HTML', 'CSS', 'JavaScript'],
            'Web Developer': ['HTML', 'CSS', 'JavaScript', 'Frameworks'],
            'Senior Web Developer': ['JavaScript', 'Architecture', 'Best Practices', 'Mentoring'],
            'Full Stack Developer': ['Frontend', 'Backend', 'Databases', 'DevOps'],
            'Lead Developer': ['Architecture', 'Leadership', 'Strategy', 'Mentoring'],
            'UX Designer': ['User Research', 'Wireframing', 'Prototyping', 'Usability Testing'],
            'Product Manager': ['Strategy', 'Market Research', 'Communication', 'Leadership'],
            'DevOps Engineer': ['Linux', 'Cloud', 'CI/CD', 'Automation']
        };
        
        return roleSkills[role] || ['Technical Skills', 'Soft Skills', 'Domain Knowledge'];
    }
    
    // Show courses modal
    window.showCourses = function(skill) {
        if (!roadmapData) return;
        
        coursesList.innerHTML = '';
        const courses = roadmapData.courses[skill] || [];
        
        if (courses.length === 0) {
            coursesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No courses found in our database for "${skill}".</p>
                    <p>Try searching online for free resources.</p>
                    <a href="https://www.google.com/search?q=free+${encodeURIComponent(skill)}+course" target="_blank" class="btn btn-primary">
                        <i class="fas fa-external-link-alt"></i> Search on Google
                    </a>
                </div>
            `;
        } else {
            const coursesGrid = document.createElement('div');
            coursesGrid.className = 'courses-grid';
            
            courses.forEach(course => {
                const courseCard = document.createElement('div');
                courseCard.className = 'course-card';
                
                const rating = (Math.random() * 2 + 3).toFixed(1);
                const ratingStars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
                
                courseCard.innerHTML = `
                    <h4>${course.course_title}</h4>
                    <div class="course-meta">
                        <span class="course-platform">
                            <i class="fas fa-play-circle"></i> ${course.platform}
                        </span>
                        <span class="course-rating">
                            ${ratingStars} ${rating}
                        </span>
                    </div>
                    <div class="course-description">
                        Learn ${skill.toLowerCase()} with this comprehensive course designed for beginners and intermediate learners.
                    </div>
                    <a href="${course.link}" target="_blank" class="course-link">
                        View Course <i class="fas fa-external-link-alt"></i>
                    </a>
                `;
                
                coursesGrid.appendChild(courseCard);
            });
            
            coursesList.appendChild(coursesGrid);
        }
        
        coursesModal.classList.remove('hidden');
    };
    
    // Close courses modal
    closeCoursesBtn.addEventListener('click', function() {
        coursesModal.classList.add('hidden');
    });
    
    // Close modal when clicking outside
    coursesModal.addEventListener('click', function(e) {
        if (e.target === coursesModal) {
            coursesModal.classList.add('hidden');
        }
    });
    
    // Save progress to localStorage
    saveBtn.addEventListener('click', function() {
        if (!roadmapData) return;
        
        const progress = {
            role: roadmapData.role,
            skills: roadmapData.skills,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('careerRoadmap', JSON.stringify(progress));
        showNotification('Your progress has been saved locally!', 'success');
    });
    
    // Export as PDF - Direct approach with better content handling
    exportBtn.addEventListener('click', function() {
        if (!roadmapData) {
            showNotification('No roadmap data available to export', 'error');
            return;
        }
        
        const exportBtn = document.getElementById('export-btn');
        const originalBtnText = exportBtn.innerHTML;
        
        // Show loading state
        exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating PDF...';
        exportBtn.disabled = true;
        
        // Hide modal for PDF export
        const modalVisible = !coursesModal.classList.contains('hidden');
        if (modalVisible) {
            coursesModal.classList.add('hidden');
        }
        
        try {
            // Create content for PDF with better debugging
            console.log('Creating PDF content for role:', roadmapData.role);
            console.log('Skills data:', roadmapData.skills);
            console.log('Progression data:', roadmapData.progression);
            
            // Build content string step by step for better error tracking
            let pdfContent = '';
            
            // Header
            pdfContent += '<div style="font-family: Arial, sans-serif; padding: 20px; background: white; color: black; line-height: 1.6;">';
            pdfContent += `<h1 style="text-align: center; color: #000; margin-bottom: 20px; font-size: 28px;">Career Path: ${roadmapData.role || 'Unknown Role'}</h1>`;
            pdfContent += '<p style="text-align: center; color: #666; font-style: italic; margin-bottom: 40px; font-size: 16px;">Your personalized career development plan</p>';
            
            // Skills Section
            pdfContent += '<h2 style="color: #000; border-bottom: 3px solid #333; padding-bottom: 10px; margin: 40px 0 20px 0; font-size: 22px;">Required Skills</h2>';
            
            if (roadmapData.skills && roadmapData.skills.length > 0) {
                roadmapData.skills.forEach((skill, index) => {
                    pdfContent += `<div style="margin: 10px 0; padding: 12px; background: #f8f8f8; border-left: 4px solid #333; border-radius: 4px;">`;
                    pdfContent += `<h4 style="margin: 0 0 5px 0; color: #000; font-size: 16px;">${index + 1}. ${skill}</h4>`;
                    
                    if (roadmapData.dependencies && roadmapData.dependencies[skill] && roadmapData.dependencies[skill].length > 0) {
                        pdfContent += `<p style="margin: 0; color: #666; font-size: 14px;">Prerequisites: ${roadmapData.dependencies[skill].join(', ')}</p>`;
                    }
                    
                    pdfContent += '</div>';
                });
            } else {
                pdfContent += '<p style="color: #666; font-size: 16px;">No skills data available.</p>';
            }
            
            // Career Progression Section
            pdfContent += '<h2 style="color: #000; border-bottom: 3px solid #333; padding-bottom: 10px; margin: 40px 0 20px 0; font-size: 22px;">Career Progression Path</h2>';
            
            if (roadmapData.progression && roadmapData.progression.length > 0) {
                roadmapData.progression.forEach((stage, index) => {
                    const description = getStageDescription(stage, index);
                    pdfContent += `<div style="margin: 15px 0; padding: 15px; background: #f0f0f0; border-radius: 8px; border-left: 4px solid #333;">`;
                    pdfContent += `<h4 style="margin: 0 0 8px 0; color: #000; font-size: 18px;">${index + 1}. ${stage}</h4>`;
                    pdfContent += `<p style="margin: 0; color: #555; font-size: 14px;">${description}</p>`;
                    pdfContent += '</div>';
                });
            } else {
                pdfContent += '<p style="color: #666; font-size: 16px;">No career progression data available.</p>';
            }
            
            // Courses Section
            if (roadmapData.courses && Object.keys(roadmapData.courses).length > 0) {
                pdfContent += '<h2 style="color: #000; border-bottom: 3px solid #333; padding-bottom: 10px; margin: 40px 0 20px 0; font-size: 22px;">Recommended Learning Resources</h2>';
                
                for (const [skill, courses] of Object.entries(roadmapData.courses)) {
                    if (courses && courses.length > 0) {
                        pdfContent += `<div style="margin: 15px 0; padding: 15px; background: #f5f5f5; border-radius: 8px;">`;
                        pdfContent += `<h4 style="margin: 0 0 10px 0; color: #000; font-size: 16px;">${skill}</h4>`;
                        
                        courses.slice(0, 3).forEach((course, index) => {
                            pdfContent += `<p style="margin: 5px 0; font-size: 14px; color: #333;">• ${course.course_title || 'Course Title'} (${course.platform || 'Platform'})</p>`;
                        });
                        
                        pdfContent += '</div>';
                    }
                }
            }
            
            // Footer
            pdfContent += `<div style="margin-top: 50px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center;">`;
            pdfContent += `<p style="font-size: 12px; color: #999; font-style: italic;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>`;
            pdfContent += '</div>';
            
            pdfContent += '</div>';
            
            console.log('PDF content length:', pdfContent.length);
            
            // Use html2pdf directly with the content string
            const element = document.createElement('div');
            element.innerHTML = pdfContent;
            element.style.backgroundColor = 'white';
            element.style.width = '100%';
            element.style.minHeight = '100vh';
            
            // Add element to document temporarily but make it visible for debugging
            element.style.position = 'absolute';
            element.style.top = '0';
            element.style.left = '0';
            element.style.zIndex = '999999';
            document.body.appendChild(element);
            
            // Scroll to top to ensure content is visible
            window.scrollTo(0, 0);
            
            const options = {
                margin: [15, 15, 15, 15],
                filename: `career-roadmap-${roadmapData.role.replace(/\s+/g, '-').toLowerCase()}.pdf`,
                image: { 
                    type: 'jpeg', 
                    quality: 1.0 
                },
                html2canvas: { 
                    scale: 2,
                    backgroundColor: '#ffffff',
                    useCORS: true,
                    allowTaint: true,
                    logging: true,
                    width: 800,
                    height: 1200
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait' 
                }
            };
            
            // Generate PDF with better error handling
            html2pdf().set(options).from(element).save().then(() => {
                console.log('PDF generation successful');
                
                // Clean up
                if (document.body.contains(element)) {
                    document.body.removeChild(element);
                }
                
                // Restore modal visibility
                if (modalVisible) {
                    coursesModal.classList.remove('hidden');
                }
                
                // Reset button state
                exportBtn.innerHTML = originalBtnText;
                exportBtn.disabled = false;
                
                showNotification('PDF exported successfully! Check your downloads folder.', 'success');
                
            }).catch(error => {
                console.error('PDF generation failed:', error);
                
                // Clean up
                if (document.body.contains(element)) {
                    document.body.removeChild(element);
                }
                
                // Restore modal visibility
                if (modalVisible) {
                    coursesModal.classList.remove('hidden');
                }
                
                // Reset button state
                exportBtn.innerHTML = originalBtnText;
                exportBtn.disabled = false;
                
                showNotification('Failed to export PDF. Please try again.', 'error');
            });
            
        } catch (error) {
            console.error('Error setting up PDF export:', error);
            
            // Reset button state
            exportBtn.innerHTML = originalBtnText;
            exportBtn.disabled = false;
            
            // Restore modal visibility
            if (modalVisible) {
                coursesModal.classList.remove('hidden');
            }
            
            showNotification('Error setting up PDF export. Please try again.', 'error');
        }
    });
    
    // Helper function to categorize skills
    function categorizeSkills(skills) {
        const categories = {
            'Programming Languages': [],
            'Web Technologies': [],
            'Frameworks & Libraries': [],
            'Tools & Platforms': [],
            'Databases': [],
            'Soft Skills': [],
            'Other Skills': []
        };
        
        const categoryMap = {
            'Programming Languages': ['Python', 'Java', 'JavaScript', 'C++', 'C#', 'PHP', 'Ruby', 'Swift', 'Go', 'Rust', 'TypeScript', 'Kotlin', 'Objective-C'],
            'Web Technologies': ['HTML', 'CSS', 'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'Django', 'Flask', 'jQuery'],
            'Frameworks & Libraries': ['React Native', 'Flutter', 'TensorFlow', 'PyTorch', 'Spring', 'Laravel', 'Rails'],
            'Tools & Platforms': ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Git', 'Linux', 'Terraform', 'Jenkins'],
            'Databases': ['SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Oracle', 'Redis', 'Firebase'],
            'Soft Skills': ['Communication', 'Problem Solving', 'Teamwork', 'Leadership', 'Time Management', 'Project Management', 'Agile', 'Scrum']
        };
        
        skills.forEach(skill => {
            let categorized = false;
            for (const [category, keywords] of Object.entries(categoryMap)) {
                if (keywords.some(keyword => skill.toLowerCase().includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(skill.toLowerCase()))) {
                    categories[category].push(skill);
                    categorized = true;
                    break;
                }
            }
            if (!categorized) {
                categories['Other Skills'].push(skill);
            }
        });
        
        // Remove empty categories
        Object.keys(categories).forEach(key => {
            if (categories[key].length === 0) {
                delete categories[key];
            }
        });
        
        return categories;
    }
    
    // Helper function to get stage description
    function getStageDescription(stage, index) {
        const descriptions = [
            'Entry-level position focusing on learning fundamentals and gaining experience',
            'Intermediate level with some experience and growing expertise',
            'Advanced level with deep expertise and mentoring responsibilities',
            'Leadership role with technical and people management duties',
            'Strategic role overseeing teams and setting technical direction'
        ];
        
        return descriptions[index] || 'Professional development stage in your career journey';
    }
    
    // Load saved progress on page load
    const savedProgress = localStorage.getItem('careerRoadmap');
    if (savedProgress) {
        try {
            const progress = JSON.parse(savedProgress);
            roleInput.value = progress.role;
            
            showNotification(`Found saved progress for "${progress.role}". Click "Generate Roadmap" to continue.`, 'info');
        } catch (e) {
            console.error('Error loading saved progress:', e);
        }
    }
    
    // Notification system
    function showNotification(message, type = 'info') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-exclamation-circle';
        if (type === 'warning') icon = 'fa-exclamation-triangle';
        
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${icon}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        const hideTimeout = setTimeout(() => {
            hideNotification(notification);
        }, 5000);
        
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(hideTimeout);
            hideNotification(notification);
        });
    }
    
    function hideNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
    
    // Helper functions for color manipulation
    function darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    
    function lightenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
});