const mongoose = require('mongoose');
const User = require('../models/User');
const About = require('../models/About');
const TechTool = require('../models/TechTool');
const Education = require('../models/Education');
const Portfolio = require('../models/Portfolio');
require('dotenv').config();

const initializeDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create default admin user
    console.log('👤 Creating default admin user...');
    const existingUser = await User.findOne({ email: 'valentinojehaut@gmail.com' });
    
    if (!existingUser) {
      const defaultUser = new User({
        email: 'valentinojehaut@gmail.com',
        password: 'Valen23tino$', // Will be hashed by pre-save middleware
        role: 'admin',
        isActive: true
      });
      
      await defaultUser.save();
      console.log('✅ Default admin user created');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Initialize default About data
    console.log('📝 Initializing About section...');
    const existingAbout = await About.findOne();
    
    if (!existingAbout) {
      const defaultAbout = new About({
        description: `Well, name's Valentino Yudhistira Jehaut (A.k.a Valen) and nice to know you!

I'm 20 years old now and currently living in Bali, Indonesia. I just graduated from SMK TI Bali Global Denpasar majoring in Software Engineering and currently pursuing Double Bachelor's Degree in Information Systems (ITB Stikom Bali) & Information Technology (HELP University)

I've had experience as a web developer for more than 2.5 years now and as a UI/UX Designer for more than a year. At that time, i'm always curious and open to trying new technologies just to enhance my skills so that i didn't miss out on the current trends.

Now, i'm currently as a UI/UX Designer & Part-time Web Developer at Bendega.id, a Web Developer at Bali Mountain Retreat and Mashup R Japan.`,
        imageURL: 'myface.jpeg'
      });
      
      await defaultAbout.save();
      console.log('✅ Default About section created');
    } else {
      console.log('ℹ️  About section already exists');
    }

    // Initialize default tech tools
    console.log('🛠️  Initializing Tech Tools...');
    const existingTools = await TechTool.countDocuments();
    
    if (existingTools === 0) {
      const defaultTechTools = [
        { title: 'HTML', imageURL: 'html5.svg', order: 1 },
        { title: 'CSS', imageURL: 'css3.svg', order: 2 },
        { title: 'JS', imageURL: 'js.svg', order: 3 },
        { title: 'PHP', imageURL: 'php.svg', order: 4 },
        { title: 'MySQL', imageURL: 'mysql.svg', order: 5 },
        { title: 'MongoDB', imageURL: 'mongodb.svg', order: 6 },
        { title: 'Bootstrap', imageURL: 'bootstrap.svg', order: 7 },
        { title: 'Tailwind', imageURL: 'tailwind.svg', order: 8 },
        { title: 'Figma', imageURL: 'figma.svg', order: 9 },
        { title: 'Github', imageURL: 'github.svg', order: 10 },
        { title: 'React JS', imageURL: 'react.svg', order: 11 },
        { title: 'Wordpress', imageURL: 'wordpress.svg', order: 12 },
        { title: 'Elementor', imageURL: 'elementor.svg', order: 13 },
        { title: 'Visual Studio Code', imageURL: 'vs.svg', order: 14 },
        { title: 'Trello', imageURL: 'trello.svg', order: 15 },
        { title: 'Slack', imageURL: 'slack.svg', order: 16 },
        { title: 'Vercel', imageURL: 'vercel.svg', order: 17 },
        { title: 'Advanced Custom Field', imageURL: 'acf.png', order: 18 },
        { title: 'Bricks Builder', imageURL: 'bricks.svg', order: 19 }
      ];
      
      await TechTool.insertMany(defaultTechTools);
      console.log(`✅ ${defaultTechTools.length} tech tools created`);
    } else {
      console.log(`ℹ️  ${existingTools} tech tools already exist`);
    }

    // Initialize default education items
    console.log('🎓 Initializing Education items...');
    const existingEducation = await Education.countDocuments();
    
    if (existingEducation === 0) {
      const defaultEducation = [
        {
          title: 'Software Engineering',
          institution: 'SMK TI Bali Global Denpasar',
          startDate: new Date('2021-07-01'),
          endDate: new Date('2024-06-01'),
          description: 'Graduated with a focus on web development and software engineering principles.',
          link: ''
        },
        {
          title: 'Information Systems (Double Degree)',
          institution: 'ITB Stikom Bali & HELP University',
          startDate: new Date('2024-08-01'),
          endDate: new Date('2028-06-01'),
          description: 'Currently pursuing a double bachelor\'s degree in Information Systems.',
          link: ''
        }
      ];
      
      await Education.insertMany(defaultEducation);
      console.log(`✅ ${defaultEducation.length} education items created`);
    } else {
      console.log(`ℹ️  ${existingEducation} education items already exist`);
    }

    // Initialize default portfolio items
    console.log('💼 Initializing Portfolio items...');
    const existingPortfolios = await Portfolio.countDocuments();
    
    if (existingPortfolios === 0) {
      const defaultPortfolios = [
        {
          title: 'Bali Connection Service',
          desc: 'Bali Connection Service (BCS) was first built in 2005 which provides help for local and expatriate community in Indonesia in assisting all types of travel documents including visas abroad and permit in Bali/Indonesia.',
          projectDetails: `## Project Overview
Bali Connection Service (BCS) was first built in 2005 which provides help for local and expatriate community in Indonesia in assisting all types of travel documents including visas abroad and permit in Bali/Indonesia.

## My Role
I make this website for my client who wants to revamp his old website to a mobile-friendly responsive website and also the client specifically request to have dual language support (Indonesian & English).

## Technologies Used
- Figma for UI/UX design
- React JS as the front-end framework
- Tailwind CSS as the CSS Framework

## Key Features
- Mobile-friendly responsive design
- Dual language support (Indonesian & English)
- Modern and clean interface
- Fast loading performance`,
          linkTo: 'https://www.bcsvisa.com',
          imageURL: 'bcs.png',
          tech: ['React JS', 'Tailwind CSS'],
          order: 1,
          isPublished: true
        },
        {
          title: 'Maje Salon',
          desc: 'Starting in 2017, Maje Salon is a small woman-only salon based in Denpasar, Bali. Their services includes Hair Mask, Hair Cutting, Facial, Tradisional Creambath, and etc.',
          projectDetails: `## Project Overview
Starting in 2017, Maje Salon is a small woman-only salon based in Denpasar, Bali. Their services includes Hair Mask, Hair Cutting, Facial, Tradisional Creambath, and etc.

## My Role
I make this as a final project for getting a certificate in Junior Web Programmer at Balai Dikat Industri.

## Technologies Used
- Figma for UI/UX design
- Bootstrap 4 as main frontend library
- Custom CMS using PHP as the main backend
- MySQL for database management

## Key Features
- Responsive design
- Custom content management system
- Service booking functionality
- Gallery showcase`,
          linkTo: '',
          imageURL: 'majesalon.png',
          tech: ['HTML', 'CSS', 'JS', 'PHP', 'MySQL'],
          order: 2,
          isPublished: true
        }
      ];
      
      await Portfolio.insertMany(defaultPortfolios);
      console.log(`✅ ${defaultPortfolios.length} portfolio items created`);
    } else {
      console.log(`ℹ️  ${existingPortfolios} portfolio items already exist`);
    }

    console.log('🎉 Database initialization completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- User: valentinojehaut@gmail.com (password: Valen23tino$)`);
    console.log(`- About section initialized`);
    console.log(`- ${await TechTool.countDocuments()} tech tools`);
    console.log(`- ${await Education.countDocuments()} education items`);
    console.log(`- ${await Portfolio.countDocuments()} portfolio items`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

initializeDatabase();
