#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BundleAnalyzer {
  constructor() {
    this.projectRoot = process.cwd();
    this.packageJsonPath = path.join(this.projectRoot, 'package.json');
    this.nextConfigPath = path.join(this.projectRoot, 'next.config.ts');
  }

  // Analyze package.json dependencies
  analyzeDependencies() {
    try {
      const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
      
      const dependencies = packageJson.dependencies || {};
      const devDependencies = packageJson.devDependencies || {};
      
      return {
        production: Object.keys(dependencies).length,
        development: Object.keys(devDependencies).length,
        total: Object.keys(dependencies).length + Object.keys(devDependencies).length,
        heavyDependencies: this.identifyHeavyDependencies(dependencies),
        productionDeps: dependencies,
        devDeps: devDependencies
      };
    } catch (error) {
      console.error('Error analyzing dependencies:', error.message);
      return null;
    }
  }

  // Identify potentially heavy dependencies
  identifyHeavyDependencies(dependencies) {
    const knownHeavyPackages = [
      '@heroicons/react',
      '@nextui-org/react',
      'framer-motion',
      'react-hook-form',
      '@stripe/stripe-js',
      'next',
      'react',
      'react-dom'
    ];

    return Object.keys(dependencies).filter(dep => 
      knownHeavyPackages.some(heavy => dep.includes(heavy))
    );
  }

  // Analyze import patterns
  analyzeImportPatterns() {
    const srcDir = path.join(this.projectRoot, 'src');
    const importPatterns = {
      heroicons: { bulk: 0, specific: 0, files: [] },
      nextui: { bulk: 0, specific: 0, files: [] },
      react: { bulk: 0, specific: 0, files: [] },
      internal: { barrel: 0, direct: 0, files: [] }
    };

    this.scanImports(srcDir, importPatterns);
    return importPatterns;
  }

  // Scan files for import patterns
  scanImports(dir, patterns) {
    if (!fs.existsSync(dir)) return;

    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.')) {
        this.scanImports(fullPath, patterns);
      } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
        this.analyzeFileImports(fullPath, patterns);
      }
    }
  }

  // Analyze imports in a single file
  analyzeFileImports(filePath, patterns) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(this.projectRoot, filePath);

      // Check for HeroIcons imports
      if (content.includes('@heroicons/react')) {
        if (content.match(/import\s+\*\s+as\s+\w+\s+from\s+['"`]@heroicons\/react/)) {
          patterns.heroicons.bulk++;
          patterns.heroicons.files.push(relativePath);
        } else if (content.match(/import\s+\{[^}]+\}\s+from\s+['"`]@heroicons\/react/)) {
          patterns.heroicons.specific++;
        }
      }

      // Check for NextUI imports
      if (content.includes('@nextui-org')) {
        if (content.match(/import\s+\*\s+as\s+\w+\s+from\s+['"`]@nextui-org/)) {
          patterns.nextui.bulk++;
          patterns.nextui.files.push(relativePath);
        } else if (content.match(/import\s+\{[^}]+\}\s+from\s+['"`]@nextui-org/)) {
          patterns.nextui.specific++;
        }
      }

      // Check for React imports
      if (content.includes('from \'react\'') || content.includes('from "react"')) {
        if (content.match(/import\s+\*\s+as\s+React\s+from\s+['"`]react['"`]/)) {
          patterns.react.bulk++;
          patterns.react.files.push(relativePath);
        } else {
          patterns.react.specific++;
        }
      }

      // Check for internal barrel imports
      const barrelImports = content.match(/import\s+\{[^}]+\}\s+from\s+['"`]\.[^'"`]*\/index['"`]/g);
      if (barrelImports) {
        patterns.internal.barrel += barrelImports.length;
        patterns.internal.files.push(relativePath);
      }

    } catch (error) {
      // Skip files that can't be read
    }
  }

  // Get build information
  getBuildInfo() {
    try {
      // Check if .next directory exists
      const nextDir = path.join(this.projectRoot, '.next');
      if (!fs.existsSync(nextDir)) {
        return { status: 'not_built', message: 'Project has not been built yet' };
      }

      // Get build stats if available
      const buildManifest = path.join(nextDir, 'build-manifest.json');
      const appBuildManifest = path.join(nextDir, 'app-build-manifest.json');
      
      let buildInfo = { status: 'built' };

      if (fs.existsSync(buildManifest)) {
        const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
        buildInfo.pages = Object.keys(manifest.pages || {}).length;
        buildInfo.assets = Object.keys(manifest.sortedPages || []).length;
      }

      if (fs.existsSync(appBuildManifest)) {
        const appManifest = JSON.parse(fs.readFileSync(appBuildManifest, 'utf8'));
        buildInfo.appPages = Object.keys(appManifest.pages || {}).length;
      }

      // Try to get static directory size
      const staticDir = path.join(nextDir, 'static');
      if (fs.existsSync(staticDir)) {
        buildInfo.staticSize = this.getDirectorySize(staticDir);
      }

      return buildInfo;
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  // Calculate directory size recursively
  getDirectorySize(dirPath) {
    let totalSize = 0;
    
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          totalSize += this.getDirectorySize(fullPath);
        } else {
          totalSize += stat.size;
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }
    
    return totalSize;
  }

  // Generate comprehensive bundle analysis report
  generateReport() {
    console.log('📦 Starting bundle analysis...\n');

    const dependencies = this.analyzeDependencies();
    const importPatterns = this.analyzeImportPatterns();
    const buildInfo = this.getBuildInfo();

    const report = {
      timestamp: new Date().toISOString(),
      dependencies,
      importPatterns,
      buildInfo,
      recommendations: this.generateRecommendations(dependencies, importPatterns)
    };

    return report;
  }

  // Generate optimization recommendations
  generateRecommendations(dependencies, importPatterns) {
    const recommendations = [];

    // Dependency recommendations
    if (dependencies && dependencies.heavyDependencies.length > 0) {
      recommendations.push({
        type: 'dependencies',
        priority: 'high',
        message: `Consider optimizing heavy dependencies: ${dependencies.heavyDependencies.join(', ')}`,
        action: 'Review if all features from these packages are needed'
      });
    }

    // Import pattern recommendations
    if (importPatterns.heroicons.bulk > 0) {
      recommendations.push({
        type: 'imports',
        priority: 'medium',
        message: `Found ${importPatterns.heroicons.bulk} bulk HeroIcons imports`,
        action: 'Replace with specific imports for better tree-shaking',
        files: importPatterns.heroicons.files
      });
    }

    if (importPatterns.nextui.bulk > 0) {
      recommendations.push({
        type: 'imports',
        priority: 'medium',
        message: `Found ${importPatterns.nextui.bulk} bulk NextUI imports`,
        action: 'Replace with specific component imports',
        files: importPatterns.nextui.files
      });
    }

    if (importPatterns.internal.barrel > 10) {
      recommendations.push({
        type: 'imports',
        priority: 'low',
        message: `Found ${importPatterns.internal.barrel} barrel imports`,
        action: 'Consider direct imports for better tree-shaking in some cases'
      });
    }

    return recommendations;
  }
}

// Main execution
async function main() {
  const analyzer = new BundleAnalyzer();
  
  try {
    const report = analyzer.generateReport();
    
    // Write detailed report to file
    const reportPath = path.join(process.cwd(), 'bundle-analysis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Print summary to console
    console.log('📦 BUNDLE ANALYSIS SUMMARY');
    console.log('=' .repeat(50));
    
    if (report.dependencies) {
      console.log(`📚 Total Dependencies: ${report.dependencies.total}`);
      console.log(`🏭 Production: ${report.dependencies.production}`);
      console.log(`🔧 Development: ${report.dependencies.development}`);
      console.log(`⚠️  Heavy Dependencies: ${report.dependencies.heavyDependencies.length}`);
      
      if (report.dependencies.heavyDependencies.length > 0) {
        console.log(`   • ${report.dependencies.heavyDependencies.join(', ')}`);
      }
    }
    
    console.log(`\n🔗 IMPORT PATTERNS:`);
    console.log(`   • HeroIcons bulk imports: ${report.importPatterns.heroicons.bulk}`);
    console.log(`   • NextUI bulk imports: ${report.importPatterns.nextui.bulk}`);
    console.log(`   • Internal barrel imports: ${report.importPatterns.internal.barrel}`);
    
    console.log(`\n🏗️  BUILD STATUS: ${report.buildInfo.status}`);
    if (report.buildInfo.staticSize) {
      console.log(`   • Static assets size: ${(report.buildInfo.staticSize / 1024 / 1024).toFixed(2)} MB`);
    }
    
    if (report.recommendations.length > 0) {
      console.log(`\n💡 RECOMMENDATIONS:`);
      report.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`);
        console.log(`      → ${rec.action}`);
      });
    }
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = BundleAnalyzer;