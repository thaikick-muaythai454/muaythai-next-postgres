#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class DependencyMapper {
  constructor() {
    this.dependencyGraph = new Map();
    this.reverseGraph = new Map();
    this.circularDeps = [];
    this.srcDir = path.join(process.cwd(), 'src');
  }

  // Extract imports from a file
  extractImports(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const imports = [];

      // Match various import patterns
      const patterns = [
        /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"`]([^'"`]+)['"`]/g,
        /require\(['"`]([^'"`]+)['"`]\)/g,
        /import\(['"`]([^'"`]+)['"`]\)/g
      ];

      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const importPath = match[1];
          if (importPath.startsWith('.')) {
            // Resolve relative path
            const resolved = this.resolveImportPath(filePath, importPath);
            if (resolved) {
              imports.push(resolved);
            }
          }
        }
      });

      return imports;
    } catch (error) {
      return [];
    }
  }

  // Resolve relative import path to absolute
  resolveImportPath(fromFile, importPath) {
    const fromDir = path.dirname(fromFile);
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const indexFiles = ['/index.ts', '/index.tsx', '/index.js', '/index.jsx'];

    // Try direct file resolution
    for (const ext of extensions) {
      const resolved = path.resolve(fromDir, importPath + ext);
      if (fs.existsSync(resolved)) {
        return path.relative(this.srcDir, resolved);
      }
    }

    // Try index file resolution
    for (const indexFile of indexFiles) {
      const resolved = path.resolve(fromDir, importPath + indexFile);
      if (fs.existsSync(resolved)) {
        return path.relative(this.srcDir, resolved);
      }
    }

    return null;
  }

  // Scan directory for files
  scanDirectory(dir) {
    const files = [];
    
    if (!fs.existsSync(dir)) return files;

    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files.push(...this.scanDirectory(fullPath));
      } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  // Build dependency graph
  buildDependencyGraph() {
    console.log('🔗 Building dependency graph...\n');

    const files = this.scanDirectory(this.srcDir);
    
    // Initialize graph
    for (const file of files) {
      const relativePath = path.relative(this.srcDir, file);
      this.dependencyGraph.set(relativePath, []);
      this.reverseGraph.set(relativePath, []);
    }

    // Build dependencies
    for (const file of files) {
      const relativePath = path.relative(this.srcDir, file);
      const imports = this.extractImports(file);
      
      this.dependencyGraph.set(relativePath, imports);
      
      // Build reverse graph
      for (const importPath of imports) {
        if (this.reverseGraph.has(importPath)) {
          this.reverseGraph.get(importPath).push(relativePath);
        }
      }
    }

    console.log(`📊 Analyzed ${files.length} files`);
    console.log(`🔗 Found ${this.getTotalDependencies()} internal dependencies\n`);
  }

  // Get total number of dependencies
  getTotalDependencies() {
    let total = 0;
    for (const deps of this.dependencyGraph.values()) {
      total += deps.length;
    }
    return total;
  }

  // Find circular dependencies
  findCircularDependencies() {
    const visited = new Set();
    const recursionStack = new Set();
    const cycles = [];

    const dfs = (node, path) => {
      if (recursionStack.has(node)) {
        // Found a cycle
        const cycleStart = path.indexOf(node);
        const cycle = path.slice(cycleStart);
        cycle.push(node);
        cycles.push(cycle);
        return;
      }

      if (visited.has(node)) return;

      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const dependencies = this.dependencyGraph.get(node) || [];
      for (const dep of dependencies) {
        if (this.dependencyGraph.has(dep)) {
          dfs(dep, [...path]);
        }
      }

      recursionStack.delete(node);
      path.pop();
    };

    for (const node of this.dependencyGraph.keys()) {
      if (!visited.has(node)) {
        dfs(node, []);
      }
    }

    this.circularDeps = cycles;
    return cycles;
  }

  // Find most referenced files
  getMostReferencedFiles(limit = 10) {
    const referenceCounts = [];
    
    for (const [file, references] of this.reverseGraph) {
      if (references.length > 0) {
        referenceCounts.push({
          file,
          count: references.length,
          referencedBy: references
        });
      }
    }

    return referenceCounts
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  // Find orphaned files (no incoming dependencies)
  getOrphanedFiles() {
    const orphaned = [];
    
    for (const [file, references] of this.reverseGraph) {
      if (references.length === 0 && !this.isEntryPoint(file)) {
        orphaned.push(file);
      }
    }

    return orphaned;
  }

  // Check if file is an entry point (page, API route, etc.)
  isEntryPoint(file) {
    const entryPatterns = [
      /^app\/.*\/page\.(ts|tsx)$/,
      /^app\/.*\/layout\.(ts|tsx)$/,
      /^app\/.*\/route\.(ts|tsx)$/,
      /^app\/.*\/loading\.(ts|tsx)$/,
      /^app\/.*\/error\.(ts|tsx)$/,
      /^app\/.*\/not-found\.(ts|tsx)$/,
      /^middleware\.(ts|tsx)$/
    ];

    return entryPatterns.some(pattern => pattern.test(file));
  }

  // Get dependency depth for a file
  getDependencyDepth(file, visited = new Set()) {
    if (visited.has(file)) return 0; // Circular dependency
    
    visited.add(file);
    const dependencies = this.dependencyGraph.get(file) || [];
    
    if (dependencies.length === 0) return 0;
    
    let maxDepth = 0;
    for (const dep of dependencies) {
      if (this.dependencyGraph.has(dep)) {
        const depth = this.getDependencyDepth(dep, new Set(visited));
        maxDepth = Math.max(maxDepth, depth);
      }
    }
    
    return maxDepth + 1;
  }

  // Generate dependency report
  generateReport() {
    this.buildDependencyGraph();
    const circularDeps = this.findCircularDependencies();
    const mostReferenced = this.getMostReferencedFiles();
    const orphaned = this.getOrphanedFiles();

    const report = {
      summary: {
        totalFiles: this.dependencyGraph.size,
        totalDependencies: this.getTotalDependencies(),
        circularDependencies: circularDeps.length,
        orphanedFiles: orphaned.length,
        mostReferencedCount: mostReferenced.length
      },
      circularDependencies: circularDeps,
      mostReferencedFiles: mostReferenced,
      orphanedFiles: orphaned,
      dependencyStats: this.getDependencyStats()
    };

    return report;
  }

  // Get dependency statistics
  getDependencyStats() {
    const stats = {
      byDirectory: new Map(),
      byFileType: new Map(),
      depthDistribution: new Map()
    };

    for (const [file, deps] of this.dependencyGraph) {
      // By directory
      const dir = path.dirname(file);
      if (!stats.byDirectory.has(dir)) {
        stats.byDirectory.set(dir, { files: 0, dependencies: 0 });
      }
      const dirStats = stats.byDirectory.get(dir);
      dirStats.files++;
      dirStats.dependencies += deps.length;

      // By file type
      const ext = path.extname(file);
      if (!stats.byFileType.has(ext)) {
        stats.byFileType.set(ext, { files: 0, dependencies: 0 });
      }
      const typeStats = stats.byFileType.get(ext);
      typeStats.files++;
      typeStats.dependencies += deps.length;

      // Dependency depth
      const depth = this.getDependencyDepth(file);
      if (!stats.depthDistribution.has(depth)) {
        stats.depthDistribution.set(depth, 0);
      }
      stats.depthDistribution.set(depth, stats.depthDistribution.get(depth) + 1);
    }

    return {
      byDirectory: Array.from(stats.byDirectory.entries()).map(([dir, data]) => ({
        directory: dir,
        ...data,
        avgDepsPerFile: data.files > 0 ? (data.dependencies / data.files).toFixed(2) : 0
      })),
      byFileType: Array.from(stats.byFileType.entries()).map(([type, data]) => ({
        fileType: type,
        ...data,
        avgDepsPerFile: data.files > 0 ? (data.dependencies / data.files).toFixed(2) : 0
      })),
      depthDistribution: Array.from(stats.depthDistribution.entries()).map(([depth, count]) => ({
        depth,
        count
      }))
    };
  }
}

// Main execution
async function main() {
  const mapper = new DependencyMapper();
  
  try {
    const report = mapper.generateReport();
    
    // Write detailed report
    const reportPath = path.join(process.cwd(), 'dependency-map-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Print summary
    console.log('🔗 DEPENDENCY MAP SUMMARY');
    console.log('=' .repeat(50));
    console.log(`📁 Total Files: ${report.summary.totalFiles}`);
    console.log(`🔗 Total Dependencies: ${report.summary.totalDependencies}`);
    console.log(`🔄 Circular Dependencies: ${report.summary.circularDependencies}`);
    console.log(`👤 Orphaned Files: ${report.summary.orphanedFiles}`);
    
    if (report.circularDependencies.length > 0) {
      console.log('\n🔄 CIRCULAR DEPENDENCIES:');
      report.circularDependencies.slice(0, 5).forEach((cycle, index) => {
        console.log(`   ${index + 1}. ${cycle.join(' → ')}`);
      });
    }
    
    if (report.mostReferencedFiles.length > 0) {
      console.log('\n⭐ MOST REFERENCED FILES:');
      report.mostReferencedFiles.slice(0, 5).forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.file} (${file.count} references)`);
      });
    }
    
    if (report.orphanedFiles.length > 0) {
      console.log(`\n👤 ORPHANED FILES (${Math.min(report.orphanedFiles.length, 10)} shown):`);
      report.orphanedFiles.slice(0, 10).forEach((file, index) => {
        console.log(`   ${index + 1}. ${file}`);
      });
    }
    
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ Dependency mapping failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DependencyMapper;