/**
 * QWorld Content Parser
 *
 * Parses Jupyter notebooks from QWorld repositories and extracts:
 * - Lesson content (markdown cells)
 * - Code examples (code cells)
 * - Images and visualizations
 * - Exercises and solutions
 */

import fs from 'fs';
import path from 'path';
import { QWORLD_CONTENT_ROOT } from './content-paths';

interface NotebookCell {
  cell_type: 'markdown' | 'code';
  source: string[];
  outputs?: unknown[];
}

interface ParsedLesson {
  title: string;
  content: string;
  code_examples: string[];
  images: string[];
  exercises: string[];
}

const QWORLD_BASE_PATH = QWORLD_CONTENT_ROOT;

/**
 * Repository mapping to learning tracks
 */
export const REPO_MAPPINGS = {
  'quantum-fundamentals': {
    repo: 'qbook101',
    path: 'qbook101',
    notebooks: [
      'QB23_Q01_Superposition_and_Quantum_States.ipynb',
      'QB23_Q02_Bloch_Sphere.ipynb',
      'QB23_Q03_Quantum_Measurement.ipynb',
      'QB31_C01_Complex_Number_Basics.ipynb',
      'QB31_C02_Quantum_States_with_Complex_Numbers.ipynb',
    ]
  },
  'quantum-gates': {
    repo: 'qbook101',
    path: 'qbook101',
    notebooks: [
      'QB31_C03_Basic_Quantum_Gates.ipynb',
      'QB31_C04_Hadamard_Gate.ipynb',
      'QB31_C05_Rotation_Gates.ipynb',
      'QB32_C01_Two_Qubit_Systems.ipynb',
      'QB32_C02_CNOT_Gate.ipynb',
    ]
  },
  'qiskit-sdk-deep-dive': {
    repo: 'qbook101',
    path: 'qbook101/appendices/C_qiskit',
    notebooks: [
      'C01_Qiskit_Installation.ipynb',
      'C02_Qiskit_Basics.ipynb',
      'C03_Qiskit_Advanced.ipynb',
    ]
  },
  'quantum-entanglement': {
    repo: 'qbook101',
    path: 'qbook101',
    notebooks: [
      'QB32_C03_Bell_States.ipynb',
      'QB32_C04_Entanglement.ipynb',
      'QB32_C05_GHZ_States.ipynb',
    ]
  },
  'quantum-algorithms': {
    repo: 'silver-qcourse511',
    path: 'silver',
    notebooks: [
      'D02_Discrete_Fourier_Transform.ipynb',
      'D03_Quantum_Fourier_Transform.ipynb',
      'D04_Phase_Estimation.ipynb',
      'D05_Order_Finding.ipynb',
      'D06_Shors_Algorithm.ipynb',
    ]
  },
  'quantum-cryptography-qkd': {
    repo: 'qkd',
    path: 'notebooks',
    notebooks: [
      'QC08_BB84_protocol.ipynb',
      'QC09_BB84_protocol_step_by_step.ipynb',
      'QC10_BB84_QBER_Calculation.ipynb',
      'QC11_BB84_Privacy_Amplification.ipynb',
      'QC16_E91_protocol.ipynb',
    ]
  },
  'quantum-error-correction': {
    repo: 'qec',
    path: 'chapters',
    notebooks: [
      'overview/what-and-why.ipynb',
      'qec-intro/repetition-code-bit-flips.ipynb',
      'qec-intro/repetition-code-phase-flips.ipynb',
      'qec-intro/shor-code.ipynb',
      'stabilizer-codes/stabilizer-codes.ipynb',
    ]
  },
  'vqe-qaoa': {
    repo: 'silver-qcourse511',
    path: 'silver',
    notebooks: [
      'C07_Multi_Qubit_Gates.ipynb',
      'C08_Parameterized_Circuits.ipynb',
    ]
  },
};

/**
 * Parse a Jupyter notebook and extract lesson content
 */
export function parseNotebook(notebookPath: string): ParsedLesson | null {
  try {
    const fullPath = path.join(QWORLD_BASE_PATH, notebookPath);

    if (!fs.existsSync(fullPath)) {
      console.warn(`Notebook not found: ${fullPath}`);
      return null;
    }

    const notebookContent = fs.readFileSync(fullPath, 'utf-8');
    const notebook = JSON.parse(notebookContent);

    let title = '';
    let content = '';
    const code_examples: string[] = [];
    const images: string[] = [];
    const exercises: string[] = [];

    // Extract title from first markdown cell
    const firstMarkdownCell = notebook.cells?.find((cell: NotebookCell) => cell.cell_type === 'markdown');
    if (firstMarkdownCell) {
      const firstLine = firstMarkdownCell.source[0] || '';
      title = firstLine.replace(/^#+\s*/, '').trim();
    }

    // Process all cells
    notebook.cells?.forEach((cell: NotebookCell) => {
      if (cell.cell_type === 'markdown') {
        const cellContent = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
        content += cellContent + '\n\n';

        // Extract image references
        const imageMatches = cellContent.match(/!\[.*?\]\((.*?)\)/g);
        if (imageMatches) {
          imageMatches.forEach(match => {
            const imagePath = match.match(/!\[.*?\]\((.*?)\)/)?.[1];
            if (imagePath) images.push(imagePath);
          });
        }

        // Detect exercises
        if (cellContent.toLowerCase().includes('exercise') || cellContent.toLowerCase().includes('task')) {
          exercises.push(cellContent);
        }
      } else if (cell.cell_type === 'code') {
        const codeContent = Array.isArray(cell.source) ? cell.source.join('') : cell.source;
        if (codeContent.trim()) {
          code_examples.push(codeContent);
        }
      }
    });

    return {
      title: title || 'Untitled Lesson',
      content,
      code_examples,
      images,
      exercises,
    };
  } catch (error) {
    console.error(`Error parsing notebook ${notebookPath}:`, error);
    return null;
  }
}

/**
 * Get lesson content for a specific track and lesson number
 */
export function getLessonContent(trackSlug: string, lessonNumber: number): ParsedLesson | null {
  const mapping = REPO_MAPPINGS[trackSlug as keyof typeof REPO_MAPPINGS];
  if (!mapping) return null;

  const notebookIndex = lessonNumber - 1;
  if (notebookIndex < 0 || notebookIndex >= mapping.notebooks.length) {
    return null;
  }

  const notebookFile = mapping.notebooks[notebookIndex];
  const notebookPath = path.join(mapping.repo, mapping.path, notebookFile);

  return parseNotebook(notebookPath);
}

/**
 * Get image path for a lesson
 */
export function getImagePath(trackSlug: string, imagePath: string): string {
  const mapping = REPO_MAPPINGS[trackSlug as keyof typeof REPO_MAPPINGS];
  if (!mapping) return imagePath;

  // Handle relative image paths from notebooks
  if (imagePath.startsWith('../images/')) {
    return path.join(QWORLD_BASE_PATH, mapping.repo, imagePath);
  }

  return imagePath;
}

/**
 * Convert markdown content to HTML
 */
export function markdownToHtml(markdown: string): string {
  // Basic markdown to HTML conversion
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-mono font-bold text-gray-200 mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-mono font-bold text-white mt-6 mb-3">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-mono font-bold text-quantum-accent mb-4">$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

  // Code inline
  html = html.replace(/`([^`]+)`/g, '<code class="text-quantum-accent bg-quantum-accent/10 px-1 rounded text-sm">$1</code>');

  // Lists
  html = html.replace(/^\* (.*$)/gim, '<li class="ml-6 text-gray-300">$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li class="ml-6 text-gray-300">$1</li>');

  // Paragraphs
  const lines = html.split('\n');
  html = lines.map(line => {
    if (line.trim() && !line.startsWith('<')) {
      return `<p class="text-gray-300 leading-relaxed mb-3">${line}</p>`;
    }
    return line;
  }).join('\n');

  // Images
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="my-4 rounded-lg border border-quantum-accent/20 max-w-full" />');

  return html;
}
