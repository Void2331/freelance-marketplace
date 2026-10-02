require("dotenv").config()

const mongoose = require("mongoose")
const JobsSchema = require("./src/models/job")
const { z } = require("zod")

const createJobSchema = z.array(z.object({
  title: z
    .string()
    .trim()
    .min(5, "Job title must be at least 5 characters")
    .max(150, "Job title cannot exceed 150 characters"),

  description: z
    .string()
    .trim()
    .min(20, "Job description must be at least 20 characters")
    .max(5000, "Job description cannot exceed 5000 characters"),

  category: z.string().trim().max(100).optional(),

  skills: z.array(z.string().trim()).optional(),

  budget: z.coerce
    .number()
    .positive("Budget must be greater than zero"),

  budgetType: z.enum(["FIXED", "HOURLY"]).optional(),

  deadline: z
    .string()
    .datetime("Deadline must be a valid date")
    .optional(),
}))

const jobData = [
    {
    title: "Full Stack Engineer for SaaS Platform", description: "We are seeking a Full Stack Engineer to join our team for a 6-month contract. You will build and maintain robust APIs using Node.js and PostgreSQL, while collaborating closely with our frontend team.", category: "Software Engineering", skills: ["Node.js", "PostgreSQL", "Docker", "REST API"], budget: 80, budgetType: "HOURLY", deadline: "2026-10-31T23:59:59Z"
  },
  {
    title: "DevOps Engineer for AWS Migration", description: "Looking for an expert AWS DevOps engineer to migrate our legacy infrastructure to a modern cloud setup. Heavy focus on infrastructure as code and zero-downtime deployment pipelines.", category: "DevOps", skills: ["AWS", "Terraform", "GitHub Actions", "Kubernetes"], budget: 95, budgetType: "HOURLY", deadline: "2026-11-20T08:00:00Z"
  },
  {
    title: "Copywriter for Tech Blog", description: "Need a seasoned copywriter to write 10 high-quality, SEO-optimized blog posts about cybersecurity trends. Articles must be authoritative, well-researched, and engaging for tech executives.", category: "Writing", skills: ["SEO Copywriting", "Content Strategy", "Cybersecurity"], budget: 1500, budgetType: "FIXED", deadline: "2026-12-05T18:30:00Z"
  },
  {
    title: "Mobile Developer (Flutter Expert)", description: "Seeking a cross-platform mobile developer to implement new features into our existing Flutter app. Tasks include state management refactoring and building clean, responsive UI layouts.", category: "Mobile Development", skills: ["Flutter", "Dart", "Bloc Pattern", "Firebase"], budget: 65, budgetType: "HOURLY", deadline: "2026-10-15T12:00:00Z"
  },
  {
    title: "Data Analyst for E-commerce Dashboards", description: "Build comprehensive Looker Studio dashboards tracking user conversion funnels and monthly recurring revenue. You will connect multiple data pipelines from Shopify and Google Analytics 4.", category: "Data Analytics", skills: ["Google Analytics 4", "Looker Studio", "SQL", "BigQuery"], budget: 2200, budgetType: "FIXED", deadline: "2026-11-01T00:00:00Z"
  },
  {
    title: "Python Scripting for Web Scraping", description: "Need a quick script to scrape real estate data from public listings daily. The script must bypass standard bot protection, parse nested HTML structures safely, and output clean JSON data.", category: "Automation", skills: ["Python", "BeautifulSoup", "Scrapy", "Selenium"], budget: 450, budgetType: "FIXED"
  },
  {
    title: "Social Media Manager for Fashion Brand", description: "Grow our Instagram and TikTok presence through organic content creation, daily community interaction, and data-driven scheduling. Must have experience managing influencer partnerships.", category: "Marketing", skills: ["Instagram Marketing", "TikTok Growth", "CapCut", "Canva"], budget: 40, budgetType: "HOURLY", deadline: "2027-01-10T17:00:00Z"
  },
  {
    title: "Solidity Developer for Smart Contract Audit", description: "Review and optimize our Ethereum-based smart contracts before mainnet deployment. Looking for a secure code reviewer who can identify gas inefficiencies and reentrancy vulnerabilities.", category: "Blockchain", skills: ["Solidity", "Hardhat", "Smart Contract Security"], budget: 7500, budgetType: "FIXED", deadline: "2026-10-25T09:00:00Z"
  },
  {
    title: "QA Automation Engineer (Cypress)", description: "Write end-to-end integration tests for a complex dashboard platform using Cypress. Ensure high test coverage across major browser runtimes and integrate the suite into our pipeline.", category: "Quality Assurance", skills: ["Cypress", "JavaScript", "E2E Testing", "CI/CD"], budget: 55, budgetType: "HOURLY", deadline: "2026-12-15T23:59:59Z"
  },
  {
    title: "Logo and Brand Identity Design", description: "Create a modern, minimalist visual identity for a new green energy startup. Deliverables include an expandable vector logo, color palette guidelines, and typography pairings.", category: "Design", skills: ["Adobe Illustrator", "Branding", "Vector Art"], budget: 850, budgetType: "FIXED", deadline: "2026-11-30T16:00:00Z"
  },
  {
    title: "SEO Expert for Site Migration Audit", description: "We are migrating our large web application to a new domain name. We need an technical SEO expert to map out redirection rules and prevent sudden organic traffic loss.", category: "Marketing", skills: ["Technical SEO", "Google Search Console", "Screaming Frog"], budget: 120, budgetType: "HOURLY"
  },
  {
    title: "Video Editor for YouTube Channel", description: "Looking for a creative video editor to transform raw footage into structured, fast-paced educational videos. Must include sound design, transitions, and engaging pop-up graphics.", category: "Video Production", skills: ["Adobe Premiere Pro", "After Effects", "Sound Design"], budget: 35, budgetType: "HOURLY", deadline: "2026-10-20T22:00:00Z"
  },
  {
    title: "WordPress Site Speed Optimization", description: "Optimize an existing WooCommerce store to achieve a Google PageSpeed score above 90 on both desktop and mobile layouts. Resolve core web vital metrics without breaking layout designs.", category: "Web Development", skills: ["WordPress", "WooCommerce", "PageSpeed Optimization"], budget: 300, budgetType: "FIXED"
  },
  {
    title: "Cybersecurity Consultant for Pentesting", description: "Perform an authorized black-box network penetration test on our internal servers. Provide a highly detailed vulnerability remediation report cataloging discovered risk vectors.", category: "Cybersecurity", skills: ["Penetration Testing", "Network Security", "Ethical Hacking"], budget: 150, budgetType: "HOURLY", deadline: "2026-11-05T06:00:00Z"
  },
  {
    title: "Shopify Theme Customization Specialist", description: "Modify our existing Premium Shopify theme layout to add a custom upsell widget directly on the product detail page using Dawn theme foundations and custom Liquid blocks.", category: "Web Development", skills: ["Shopify", "Liquid", "HTML/CSS", "JavaScript"], budget: 600, budgetType: "FIXED", deadline: "2026-10-18T14:30:00Z"
  },
    {
    title: "Machine Learning Engineer for Chatbot RAG Pipeline", description: "We need an AI engineer to optimize our Retrieval-Augmented Generation system. You will fine-tune embedding models and build an efficient vector database indexing strategy to minimize response latency.", category: "Artificial Intelligence", skills: ["LangChain", "Pinecone", "Python", "OpenAI API"], budget: 110, budgetType: "HOURLY", deadline: "2026-11-12T15:00:00Z"
  },
  {
    title: "HubSpot Integration and Automation Expert", description: "Looking for a specialist to connect our custom web application with HubSpot CRM. You will configure webhooks, automate pipeline workflows, and map custom user payload properties accurately.", category: "Automation", skills: ["HubSpot API", "Zapier", "Webhooks", "Node.js"], budget: 1800, budgetType: "FIXED", deadline: "2026-11-25T17:30:00Z"
  },
  {
    title: "Three.js Specialist for Interactive 3D Landing Page", description: "Seeking a creative frontend developer to build an immersive 3D landing page showcasing a luxury product line. Must be highly skilled with custom shaders, lighting rigs, and web performance optimization.", category: "Web Development", skills: ["Three.js", "WebGL", "React Three Fiber", "JavaScript"], budget: 4500, budgetType: "FIXED", deadline: "2026-12-20T23:59:59Z"
  },
  {
    title: "Ghostwriter for Leadership Book on Tech Startups", description: "In search of an experienced ghostwriter to draft a 40,000-word book capturing insights from a tech founder. You will transcribe interviews, outline chapters, and write in an engaging tone.", category: "Writing", skills: ["Ghostwriting", "Creative Writing", "Content Strategy"], budget: 75, budgetType: "HOURLY", deadline: "2027-03-01T09:00:00Z"
  },
  {
    title: "Stripe Payment System Integration Specialist", description: "Need a developer to implement Stripe Connect for a multi-vendor marketplace platform. Tasks include setting up split payments, handling automatic payouts, and managing subscription webhook errors safely.", category: "Web Development", skills: ["Stripe API", "Node.js", "Backend Architecture"], budget: 1250, budgetType: "FIXED"
  },
  {
    title: "3D Environment Artist for Indie Game", description: "Looking for a stylized 3D artist to model modular environment assets for a fantasy RPG title. Deliverables include low-poly buildings, terrain flora, and optimized texture atlases.", category: "Game Development", skills: ["Blender", "Substance Painter", "Unity", "3D Modeling"], budget: 50, budgetType: "HOURLY", deadline: "2026-11-30T12:00:00Z"
  },
  {
    title: "Google Ads Campaign Specialist for SaaS Launch", description: "Set up and manage a comprehensive Google Ads search network campaign targeting B2B buyers. Responsibilities include extensive keyword research, ad copy creation, and strict conversion tracking setup.", category: "Marketing", skills: ["Google Ads", "PPC Marketing", "Google Tag Manager"], budget: 70, budgetType: "HOURLY", deadline: "2026-10-22T18:00:00Z"
  },
  {
    title: "Rust Developer to Build High-Performance Parser", description: "We need a memory-safe, ultra-fast data parser written entirely in Rust. The library will process massive streaming log files and output structured binary formats with zero memory allocations.", category: "Software Engineering", skills: ["Rust", "Systems Programming", "Data Structures"], budget: 3500, budgetType: "FIXED", deadline: "2026-12-10T00:00:00Z"
  },
  {
    title: "Illustrator for Children's Book Series", description: "Seeking a talented illustrator to create 24 vibrant, full-page digital illustrations for an upcoming children's storybook. Characters must be warm, expressive, and visually consistent throughout.", category: "Design", skills: ["Digital Illustration", "Procreate", "Character Design"], budget: 2000, budgetType: "FIXED", deadline: "2027-01-15T16:00:00Z"
  },
  {
    title: "Salesforce Administrator for Data Migration", description: "Clean up and migrate customer accounts from a legacy CRM instance over into Salesforce Lightning. Ensure data deduplication, configure custom object fields, and map user access profiles.", category: "Business Automation", skills: ["Salesforce CRM", "Data Migration", "Data Cleaning"], budget: 60, budgetType: "HOURLY"
  },
  {
    title: "Email Marketing Expert (Klaviyo Architect)", description: "Design and build advanced customer lifecycle automated email flows for an established brand. Set up abandoned cart, post-purchase win-back, and welcome sequences alongside strict segment targeting.", category: "Marketing", skills: ["Klaviyo", "Email Automation", "Copywriting", "A/B Testing"], budget: 1100, budgetType: "FIXED", deadline: "2026-11-05T20:00:00Z"
  },
  {
    title: "UI Designer for Desktop Dashboard App", description: "Seeking an interface expert to design a data-dense dark-themed control center dashboard for industrial machinery. Deliver clear layout patterns for complex graphing and configuration tables.", category: "Design", skills: ["Figma", "UI Design", "Design Systems"], budget: 55, budgetType: "HOURLY", deadline: "2026-10-29T14:00:00Z"
  },
  {
    title: "Dockerize Legacy PHP Application Stack", description: "Package an existing legacy PHP 7.2 application along with its specific MySQL and Redis database configurations into stable, clean production-ready Docker containers for easier hosting.", category: "DevOps", skills: ["Docker", "Docker Compose", "PHP", "Linux Server"], budget: 400, budgetType: "FIXED"
  },
  {
    title: "Financial Analyst for Startup Pitch Deck Model", description: "Build a robust 5-year financial projection spreadsheet including income statements, cash flow charts, and burn rate analysis. The model must allow clean sensitivity parameter adjustments.", category: "Finance", skills: ["Financial Modeling", "Microsoft Excel", "Startup Valuation"], budget: 85, budgetType: "HOURLY", deadline: "2026-11-18T10:30:00Z"
  },
  {
    title: "GraphQL API Development Expert (Apollo)", description: "Design and implement a highly optimized GraphQL schema server on top of an existing microservices backend system. Focus heavily on resolver batching techniques to eliminate N+1 query patterns.", category: "Software Engineering", skills: ["GraphQL", "Apollo Server", "Node.js", "TypeScript"], budget: 3200, budgetType: "FIXED", deadline: "2026-12-01T23:59:59Z"
  }

];


(async function seedJobQuery(){
    try {

        await mongoose.connect(process.env.MONGO_URI)
        console.log("connected")

        await JobsSchema.deleteMany()

        const {error,data} = createJobSchema.safeParse(jobData)

        if(error) {
            throw new Error(error)
        }

        await JobsSchema.insertMany(data)



    } catch (err) {
        console.log("error seeding database:" + ' ' + err)
        await mongoose.disconnect()
        process.exit(1)
    }finally{
        await mongoose.disconnect()
        console.log("mongoose disconnected gracefully")
    }
}())