import ts from 'typescript';
import { z } from 'zod';

export const AnalysisResultSchema = z.object({
    complexity: z.enum(['low', 'medium', 'high']),
    metrics: z.object({
        lines: z.number(),
        functions: z.number(),
        classes: z.number(),
        statements: z.number()
    }),
    suggestions: z.array(z.string())
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export class CodeAnalyzer {
    public analyze(code: string, language: string = 'typescript'): AnalysisResult {
        // Basic metrics
        const lines = code.split('\n').length;
        let functionCount = 0;
        let classCount = 0;
        let statementCount = 0;
        const suggestions: string[] = [];

        // Use TypeScript Compiler API for more accurate analysis
        const sourceFile = ts.createSourceFile(
            'temp.ts',
            code,
            ts.ScriptTarget.Latest,
            true
        );

        const visit = (node: ts.Node) => {
            if (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node) || ts.isMethodDeclaration(node)) {
                functionCount++;
                // Check for long functions
                const start = sourceFile.getLineAndCharacterOfPosition(node.getStart());
                const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
                if (end.line - start.line > 20) {
                    suggestions.push(`Function at line ${start.line + 1} is too long (${end.line - start.line} lines). Consider breaking it down.`);
                }
            }
            if (ts.isClassDeclaration(node)) {
                classCount++;
            }
            if (ts.isStatement(node) && !ts.isBlock(node)) {
                statementCount++;
            }
            ts.forEachChild(node, visit);
        };

        visit(sourceFile);

        // Calculate complexity
        let complexity: 'low' | 'medium' | 'high' = 'low';
        if (lines > 100 || functionCount > 10) complexity = 'medium';
        if (lines > 300 || functionCount > 20) complexity = 'high';

        // Generate suggestions based on metrics
        if (lines > 200) {
            suggestions.push('File is getting large. Consider splitting it into modules.');
        }
        if (statementCount > 50 && functionCount === 0) {
            suggestions.push('Too many top-level statements. Consider wrapping logic in functions.');
        }
        if (code.includes('any')) {
            // Simple text based check for 'any' for now, could be AST based
            suggestions.push('Avoid using "any" type. It bypasses type safety.');
        }
        if (code.includes('console.log')) {
            suggestions.push('Remove console.log statements before committing.');
        }

        if (suggestions.length === 0) {
            suggestions.push('Code looks good! functional and concise.');
        }

        return {
            complexity,
            metrics: {
                lines,
                functions: functionCount,
                classes: classCount,
                statements: statementCount
            },
            suggestions: suggestions.slice(0, 5) // Limit to top 5
        };
    }

    public debug(code: string, error?: string): string {
        try {
            const analysis = this.analyze(code);
            const issues: string[] = [];

            if (analysis.suggestions.length > 0) {
                issues.push('Code Improvement Suggestions:');
                analysis.suggestions.forEach(s => issues.push(`- ${s}`));
            }

            if (error) {
                issues.push('\nPossible Error Causes:');
                if (error.includes('ReferenceError') || error.includes('undefined')) {
                    issues.push('- Check for undefined variables or properties.');
                    issues.push('- Ensure all imports are correct.');
                }
                if (error.includes('TypeError')) {
                    issues.push('- Check for type mismatches.');
                    issues.push('- Verify object properties exist before accessing.');
                }
            } else {
                if (code.includes('any')) issues.push('- Usage of "any" type reduces type safety.');
                if (code.includes('console.log')) issues.push('- Production code should not contain console.log.');
            }

            if (issues.length === 0) return "No obvious issues found in static analysis.";
            return issues.join('\n');
        } catch (e) {
            return "Could not analyze code for debugging.";
        }
    }

    public explain(code: string): string {
        try {
            const analysis = this.analyze(code);
            const { metrics, complexity } = analysis;

            return `
Code Analysis Summary:
- **Complexity**: ${complexity.toUpperCase()}
- **Structure**:
  - ${metrics.lines} lines of code
  - ${metrics.functions} functions
  - ${metrics.classes} classes
  - ${metrics.statements} top-level statements

This code appears to be a ${complexity} complexity module. It contains ${metrics.functions} functions and uses ${metrics.classes > 0 ? 'object-oriented' : 'functional or script-like'} patterns.
            `.trim();
        } catch (e) {
            return "Could not explain code.";
        }
    }
}

export const analyzer = new CodeAnalyzer();
