#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class CodebaseAnalyzer {
  constructor() {
    this.fileMap = new Map();
    this.dependencyMap = new Map();
    this.duplicateFiles = new Map();
    this.unusedExports = new Set();
    this.importMap = new Map();
    this.exportMap = new Map();
    this.srcDir = path.join(process.cwd(), 'src');
    this.testsDir = path.join(process.cwd(), 'tests');
    this.appDir = path.join(process.cwd(), 'src/app');
  }

  // Get file hash for duplicate detection
  getFileHash(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      // Remove whitespace and comments for better duplicate detection
      const normalized = content
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
        .replace(/\/\/.*$/gm, '') // Remove line comments
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      return crypto.createHash('md5').update(normalized).digest('hex');
    } catch (error) {
      return null;
    }
  }

  // Extract imports and exports from a file
  analyzeFileImportsExports(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const imports = [];
      const exports = [];

      // Match import statements
      const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"`]([^'"`]+)['"`]/g;
      let importMatch;
      while ((importMatch = importRegex.exec(content)) !== null) {
        imports.push(importMatch[1]);
      }

      // Match export statements
      const exportRegex = /export\s+(?:default\s+)?(?:const|let|var|function|class|interface|type|enum)\s+(\w+)/g;
      let exportMatch;
      while ((exportMatch = exportRegex.exec(content)) !== null) {
        exports.push(exportMatch[1]);
      }

      // Match named exports
      const namedExportRegex = /export\s+\{([^}]+)\}/g;
      let namedExportMatch;
      while ((namedExportMatch = namedExportRegex.exec(content)) !== null) {
        const namedExports = namedExportMatch[1].split(',').map(e => e.trim().split(' as ')[0]);
        exports.push(...namedExports);
      }

      return { imports, exports };
    } catch (error) {
      return { imports: [], exports: [] };
    }
  }

  // Recursively scan directory for files
  scanDirectory(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
    const files = [];
    
    if (!fs.existsSync(dir)) {
      return files;
    }

    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files.push(...this.scanDirectory(fullPath, extensions));
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  // Analyze all files in the codebase
  analyzeCodebase() {
    console.log('🔍 Starting codebase analysis...\n');

    // Get all source files
    const allFiles = [
      ...this.scanDirectory(this.srcDir),
      ...this.scanDirectory(this.testsDir),
      ...this.scanDirectory(this.appDir)
    ];

    console.log(`📁 Found ${allFiles.length} files to analyze\n`);

    // Analyze each file
    for (const filePath of allFiles) {
      const relativePath = path.relative(process.cwd(), filePath);
      const hash = this.getFileHash(filePath);
      const { imports, exports } = this.analyzeFileImportsExports(filePath);

      // Store file info
      this.fileMap.set(relativePath, {
        path: relativePath,
        hash,
        size: fs.statSync(filePath).size,
        imports,
        exports
      });

      // Track imports and exports
      this.importMap.set(relativePath, imports);
      this.exportMap.set(relativePath, exports);

      // Check for duplicates
      if (hash) {
        if (!this.duplicateFiles.has(hash)) {
          this.duplicateFiles.set(hash, []);
        }
        this.duplicateFiles.get(hash).push(relativePath);
      }
    }

    this.buildDependencyMap();
    this.findUnusedExports();
  }

  // Build dependency map
  buildDependencyMap() {
    for (const [filePath, fileInfo] of this.fileMap) {
      const dependencies = [];
      
      for (const importPath of fileInfo.imports) {
        // Resolve relative imports
        if (importPath.startsWith('.')) {
          const resolvedPath = this.resolveImport(filePath, importPath);
          if (resolvedPath) {
            dependencies.push(resolvedPath);
          }
        } else {
          // External dependency
          dependencies.push(importPath);
        }
      }
      
      this.dependencyMap.set(filePath, dependencies);
    }
  }

  // Resolve relative import paths
  resolveImport(fromFile, importPath) {
    const fromDir = path.dirname(fromFile);
    const possibleExtensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
    
    for (const ext of possibleExtensions) {
      const resolvedPath = path.resolve(fromDir, importPath + ext);
      const relativePath = path.relative(process.cwd(), resolvedPath);
      
      if (this.fileMap.has(relativePath)) {
        return relativePath;
      }
    }
    
    return null;
  }

  // Find unused exports
  findUnusedExports() {
    const allImportedNames = new Set();
    
    // Collect all imported names
    for (const [filePath, imports] of this.importMap) {
      for (const importPath of imports) {
        if (importPath.startsWith('.')) {
          const resolvedPath = this.resolveImport(filePath, importPath);
          if (resolvedPath) {
            // This is a simplified approach - in reality, we'd need to parse
            // the actual imported names, not just the file paths
            allImportedNames.add(resolvedPath);
          }
        }
      }
    }

    // Find exports that are never imported
    for (const [filePath, exports] of this.exportMap) {
      if (!allImportedNames.has(filePath) && exports.length > 0) {
        this.unusedExports.add(filePath);
      }
    }
  }

  // Generate comprehensive report
  generateReport() {
    const report = {
      summary: {
        totalFiles: this.fileMap.size,
        totalSize: Array.from(this.fileMap.values()).reduce((sum, file) => sum + file.size, 0),
        duplicateGroups: Array.from(this.duplicateFiles.values()).filter(group => group.length > 1).length,
        potentialUnusedFiles: this.unusedExports.size
      },
      duplicateFiles: this.getDuplicateFilesReport(),
      unusedFiles: this.getUnusedFilesReport(),
      dependencyAnalysis: this.getDependencyAnalysis(),
      componentAnalysis: this.getComponentAnalysis(),
      serviceAnalysis: this.getServiceAnalysis()
    };

    return report;
  }

  // Get duplicate files report
  getDuplicateFilesReport() {
    const duplicates = [];
    
    for (const [hash, files] of this.duplicateFiles) {
      if (files.length > 1) {
        duplicates.push({
          hash,
          files,
          size: this.fileMap.get(files[0])?.size || 0
        });
      }
    }
    
    return duplicates.sort((a, b) => b.size - a.size);
  }

  // Get unused files report
  getUnusedFilesReport() {
    return Array.from(this.unusedExports).map(filePath => ({
      path: filePath,
      size: this.fileMap.get(filePath)?.size || 0,
      exports: this.fileMap.get(filePath)?.exports || []
    })).sort((a, b) => b.size - a.size);
  }

  // Get dependency analysis
  getDependencyAnalysis() {
    const externalDeps = new Set();
    const internalDeps = new Map();
    
    for (const [filePath, deps] of this.dependencyMap) {
      for (const dep of deps) {
        if (dep.startsWith('.') || this.fileMap.has(dep)) {
          // Internal dependency
          if (!internalDeps.has(dep)) {
            internalDeps.set(dep, []);
          }
          internalDeps.get(dep).push(filePath);
        } else {
          // External dependency
          externalDeps.add(dep);
        }
      }
    }

    return {
      externalDependencies: Array.from(externalDeps).sort(),
      mostReferencedFiles: Array.from(internalDeps.entries())
        .map(([file, refs]) => ({ file, referenceCount: refs.length }))
        .sort((a, b) => b.referenceCount - a.referenceCount)
        .slice(0, 20)
    };
  }

  // Analyze components
  getComponentAnalysis() {
    const components = Array.from(this.fileMap.keys())
      .filter(path => path.includes('/components/') && (path.endsWith('.tsx') || path.endsWith('.jsx')))
      .map(path => ({
        path,
        name: path.split('/').pop().replace(/\.(tsx|jsx)$/, ''),
        directory: path.split('/').slice(0, -1).join('/'),
        size: this.fileMap.get(path).size
      }));

    // Group by name to find potential duplicates
    const componentsByName = new Map();
    for (const component of components) {
      if (!componentsByName.has(component.name)) {
        componentsByName.set(component.name, []);
      }
      componentsByName.get(component.name).push(component);
    }

    const duplicateComponents = Array.from(componentsByName.entries())
      .filter(([name, comps]) => comps.length > 1)
      .map(([name, comps]) => ({ name, components: comps }));

    return {
      totalComponents: components.length,
      duplicateComponents,
      componentsByDirectory: this.groupByDirectory(components)
    };
  }

  // Analyze services
  getServiceAnalysis() {
    const services = Array.from(this.fileMap.keys())
      .filter(path => path.includes('/services/') && path.endsWith('.ts'))
      .map(path => ({
        path,
        name: path.split('/').pop().replace('.ts', ''),
        exports: this.fileMap.get(path).exports,
        size: this.fileMap.get(path).size
      }));

    return {
      totalServices: services.length,
      services: services.sort((a, b) => b.size - a.size)
    };
  }

  // Group items by directory
  groupByDirectory(items) {
    const grouped = new Map();
    
    for (const item of items) {
      const dir = item.directory;
      if (!grouped.has(dir)) {
        grouped.set(dir, []);
      }
      grouped.get(dir).push(item);
    }
    
    return Array.from(grouped.entries()).map(([directory, items]) => ({
      directory,
      count: items.length,
      items
    }));
  }
}

// Main execution
async function main() {
  const analyzer = new CodebaseAnalyzer();
  
  try {
    analyzer.analyzeCodebase();
    const report = analyzer.generateReport();
    
    // Write detailed report to file
    const reportPath = path.join(process.cwd(), 'codebase-analysis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Print summary to console
    console.log('📊 CODEBASE ANALYSIS SUMMARY');
    console.log('=' .repeat(50));
    console.log(`📁 Total Files: ${report.summary.totalFiles}`);
    console.log(`📦 Total Size: ${(report.summary.totalSize / 1024).toFixed(2)} KB`);
    console.log(`🔄 Duplicate Groups: ${report.summary.duplicateGroups}`);
    console.log(`❌ Potentially Unused Files: ${report.summary.potentialUnusedFiles}`);
    console.log(`🧩 Total Components: ${report.componentAnalysis.totalComponents}`);
    console.log(`🔧 Total Services: ${report.serviceAnalysis.totalServices}`);
    
    if (report.duplicateFiles.length > 0) {
      console.log('\n🔄 DUPLICATE FILES:');
      report.duplicateFiles.slice(0, 10).forEach(dup => {
        console.log(`  • ${dup.files.join(' | ')} (${(dup.size / 1024).toFixed(2)} KB)`);
      });
    }
    
    if (report.componentAnalysis.duplicateComponents.length > 0) {
      console.log('\n🧩 DUPLICATE COMPONENTS:');
      report.componentAnalysis.duplicateComponents.forEach(dup => {
        console.log(`  • ${dup.name}: ${dup.components.map(c => c.path).join(' | ')}`);
      });
    }
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = CodebaseAnalyzer;