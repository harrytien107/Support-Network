# Network Tools Suite

A comprehensive web application for network administrators and engineers, featuring advanced IP address management, subnet calculations, and network analysis tools. Built with modern web technologies including React, TypeScript, and Vite.

## 🌐 Live Demo

**Try it now: [https://glasspham.github.io/Support-Network/](https://glasspham.github.io/Support-Network/)**

The application is deployed and running live on GitHub Pages. You can access all features directly in your browser without any installation.

## 📋 Project Description

The Network Tools Suite is a powerful, browser-based application designed to simplify complex networking tasks. This project provides a suite of tools for:

### 🌐 Core Features

- **VLSM (Variable Length Subnet Masking) Calculator**: Advanced subnet calculations with custom subnet sizes
- **IP Address Validation & Analysis**: Comprehensive IP address checking and validation tools
- **IP Aggregation & Supernetting**: Automatic route summarization and network aggregation
- **Binary/Decimal Conversion**: Convert between different number representations for networking
- **Subnet Planning**: Plan and optimize network topologies with intelligent subnet allocation
- **Network Range Analysis**: Analyze IP ranges, calculate usable hosts, and determine network boundaries

### 🎯 Target Users

- **Network Engineers**: Simplify daily subnet calculations and network planning
- **System Administrators**: Validate IP configurations and plan network expansions
- **Students & Educators**: Learn networking concepts with interactive tools
- **IT Professionals**: Quick reference for network troubleshooting and design

### � Key Benefits

- **No Installation Required**: Browser-based tools accessible anywhere
- **Real-time Calculations**: Instant results with interactive interfaces
- **Educational Value**: Visual representations help understand networking concepts
- **Professional Grade**: Accurate calculations suitable for production environments
- **Mobile Friendly**: Responsive design works on all devices

## 🚀 Technology Stack

- **React 18** - Modern UI library with hooks and functional components
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Lightning-fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Bootstrap 5** - Additional UI components and responsive grid
- **Lucide React** - Beautiful and consistent icon library
- **ESLint** - Code quality and consistency enforcement

## 📋 System Requirements

- **Node.js** (version 16 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Glasspham/Support-Network.git
cd Support-Network
```

### 2. Install Dependencies

```bash
npm install
```

Or if you prefer yarn:

```bash
yarn install
```

### 3. Start Development Server

```bash
npm run dev
```

Or with yarn:

```bash
yarn dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

### 5. Preview Production Build

```bash
npm run preview
```

### 6. Run Code Linting

```bash
npm run lint
```

## 🚀 Deployment

This project is automatically deployed to GitHub Pages at [https://glasspham.github.io/Support-Network/](https://glasspham.github.io/Support-Network/)

### Deploy to GitHub Pages

The project includes GitHub Actions workflow for automatic deployment:

1. **Push to main branch** - Automatically triggers deployment
2. **Build process** - Vite builds the project for production
3. **Deploy** - Files are deployed to GitHub Pages
4. **Live site** - Available at the GitHub Pages URL

### Manual Deployment

To deploy manually:

```bash
# Build the project
npm run build

# Deploy to GitHub Pages (if you have gh-pages package)
npm run deploy
```

## 📁 Project Structure

```
├── js/                  # Core networking logic modules
│   ├── binaryMap.js     # Binary/decimal conversion utilities
│   ├── ipAggregator.js  # IP aggregation and supernetting logic
│   ├── ipChecker.js     # IP address validation and analysis
│   ├── uiHandler.js     # User interface event handlers
│   └── vlsmLogic.js     # VLSM calculation algorithms
├── src/                 # React TypeScript source code
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   ├── index.css        # Global styles and Tailwind imports
│   └── vite-env.d.ts    # TypeScript environment declarations
├── .gitignore           # Git ignore file for excluding files from version control
├── eslint.config.js     # ESLint configuration for code linting rules
├── index.html           # HTML template with Bootstrap integration
├── package-lock.json    # Auto-generated dependency lock file
├── package.json         # Project dependencies and npm scripts
├── postcss.config.js    # PostCSS configuration for Tailwind processing
├── README.md            # Project documentation (this file)
├── style.css            # Custom styles and component styling
├── tailwind.config.js   # Tailwind CSS configuration and customization
├── tsconfig.app.json    # TypeScript config for application code
├── tsconfig.json        # Main TypeScript compiler configuration
├── tsconfig.node.json   # TypeScript config for Node.js build tools
└── vite.config.ts       # Vite bundler configuration and plugins
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Create optimized production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

## 🌟 Key Features & Modules

### VLSM Calculator (`vlsmLogic.js`)

- Calculate optimal subnet sizes for given requirements
- Support for custom host requirements per subnet
- Automatic subnet allocation with minimal waste
- Binary and decimal representation of results

### IP Address Validator (`ipChecker.js`)

- Validate IP address format and ranges
- Check if IP is assignable within a subnet
- Identify network, broadcast, and usable IP ranges
- Support for both IPv4 validation

### IP Aggregation Tool (`ipAggregator.js`)

- Automatic route summarization
- Find longest common prefix for multiple networks
- Optimize routing tables with supernetting
- Calculate aggregate network addresses

### Binary Mapping Utilities (`binaryMap.js`)

- Convert between CIDR notation and subnet masks
- Binary to decimal and decimal to binary conversion
- Wildcard mask calculations
- Network address calculations

## 🔍 Troubleshooting

### Common Issues:

1. **Port Already in Use**: If port 5173 is occupied, Vite will automatically select another available port
2. **Module Not Found**: Run `npm install` to reinstall dependencies
3. **TypeScript Errors**: Check `tsconfig.json` configuration and ensure all type definitions are installed
4. **Build Failures**: Clear cache and reinstall dependencies

### Reset Project Dependencies:

```bash
# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or on Windows PowerShell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

## 📝 Development Workflow

To start developing:

1. Open terminal in project directory
2. Run `npm run dev` to start development server
3. Open browser at `http://localhost:5173`
4. Edit files in `src/` directory for React components
5. Edit files in `js/` directory for networking logic
6. Changes will hot-reload automatically
7. Use browser developer tools for debugging

## 🧪 Testing Network Calculations

The application includes several built-in examples and test cases:

- **VLSM Scenarios**: Test with different subnet requirements
- **IP Validation**: Try various IP formats and edge cases
- **Aggregation Examples**: Practice with multiple network ranges
- **Binary Conversion**: Verify calculations with known values

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Contribution Guidelines:

- Follow TypeScript best practices
- Add comments for complex networking algorithms
- Test calculations with known correct values
- Update documentation for new features
- Maintain consistent code style with ESLint

## 🙏 Acknowledgments

- Built with modern web technologies for optimal performance
- Inspired by the need for accessible networking tools
- Thanks to the open-source community for amazing libraries
- Deployed with GitHub Pages for easy accessibility

## 🔗 Links

- **Live Application**: [https://glasspham.github.io/Support-Network/](https://glasspham.github.io/Support-Network/)
- **GitHub Repository**: [https://github.com/Glasspham/Support-Network](https://github.com/Glasspham/Support-Network)
- **Issues & Feedback**: [GitHub Issues](https://github.com/Glasspham/Support-Network/issues)

---

_Built with ❤️ using Vite + React + TypeScript for the networking community_
