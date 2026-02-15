import { DifficultyLevel, LearningStyle, CodeExample, DiagramData } from '../types';

export class ContentGenerator {

    generateSummary(concept: string, level: DifficultyLevel): string {
        const templates: Record<DifficultyLevel, string[]> = {
            beginner: [
                `${concept} is a fundamental building block in this domain. Think of it as a starting point.`,
                `At its core, ${concept} handles basic operations essential for beginners.`,
                `${concept} introduces the primary syntax and structure you need to get started.`
            ],
            intermediate: [
                `${concept} connects multiple basic ideas to form more complex workflows.`,
                `With ${concept}, you can handle more specific cases and error states.`,
                `${concept} bridges the gap between simple scripts and structured applications.`
            ],
            advanced: [
                `${concept} allows for performance optimization and custom architectural patterns.`,
                `In advanced scenarios, ${concept} manages scalability and asynchronous complexities.`,
                `Deep understanding of ${concept} unlocks meta-programming and internal customization.`
            ],
            expert: [
                `${concept} at an expert level involves compiler-level optimizations and memory management.`,
                `Mastery of ${concept} enables you to contribute to core libraries and define standards.`,
                `${concept} is critical for high-frequency low-latency systems.`
            ]
        };

        const options = templates[level];
        return options[Math.floor(Math.random() * options.length)];
    }

    generateExample(concept: string, level: DifficultyLevel): CodeExample {
        let code = '';
        let explanation = '';

        switch (level) {
            case 'beginner':
                code = `// Basic usage of ${concept}\nconst result = ${concept.toLowerCase()}(basicInput);\nconsole.log(result);`;
                explanation = `A simple example showing the default behavior of ${concept}.`;
                break;
            case 'intermediate':
                code = `// Error handling with ${concept}\ntry {\n  const data = await ${concept.toLowerCase()}(input);\n} catch (e) {\n  console.error('Failed:', e);\n}`;
                explanation = `Handling common edge cases and errors when using ${concept}.`;
                break;
            case 'advanced':
                code = `// Async pattern with ${concept}\nconst pipeline = new ${concept}Pipeline();\npipeline.use(middleware).process(data);`;
                explanation = `Integrating ${concept} into a larger asynchronous processing pipeline.`;
                break;
            case 'expert':
                code = `// Custom implementation of ${concept}\nclass Optimized${concept} extends Core${concept} {\n  constructor(opts) { super(opts); }\n}`;
                explanation = `Extending the core behavior of ${concept} for performance.`;
                break;
        }

        return {
            language: 'typescript',
            code,
            explanation,
            runnable: true
        };
    }

    generateAnalogy(concept: string, level: DifficultyLevel): string {
        const analogies = [
            `Think of ${concept.toLowerCase()} like a car engine's transmission system.`,
            `${concept} acts like a traffic controller directing data flow.`,
            `Imagine ${concept} as a blueprint for constructing a building.`,
            `It's similar to how a library organizes books by category.`
        ];
        return analogies[Math.floor(Math.random() * analogies.length)];
    }

    generateDiagram(concept: string, level: DifficultyLevel): DiagramData {
        return {
            type: 'flowchart',
            title: `${concept} Workflow (${level})`,
            data: `graph TD;\n  Start --> ${concept};\n  ${concept} --> End;`,
            description: `A visual flow of how ${concept} processes data at the ${level} level.`
        };
    }
}
