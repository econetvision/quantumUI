import fs from "fs/promises";
import path from "path";

export interface NotebookCell {
  cell_type: "markdown" | "code";
  source: string[];
  metadata?: Record<string, unknown>;
  outputs?: unknown[];
}

export interface Notebook {
  cells: NotebookCell[];
  metadata?: Record<string, unknown>;
}

export interface ParsedLab {
  title: string;
  description: string;
  markdown: string;
  starterCode: string;
  solutionCode?: string;
  isExercise: boolean;
  hints: string[];
  topics: string[];
}

export class NotebookParser {
  async parseNotebook(filePath: string): Promise<ParsedLab> {
    const content = await fs.readFile(filePath, "utf-8");
    const notebook: Notebook = JSON.parse(content);

    const title = this.extractTitle(notebook, filePath);
    const description = this.extractDescription(notebook);
    const markdown = this.extractMarkdown(notebook);
    const { starterCode, solutionCode } = this.extractCode(notebook);
    const isExercise = this.isExerciseNotebook(filePath, notebook);
    const hints = this.extractHints(notebook);
    const topics = this.extractTopics(notebook, filePath);

    return {
      title,
      description,
      markdown,
      starterCode,
      solutionCode,
      isExercise,
      hints,
      topics,
    };
  }

  /**
   * Extract a lab title from a QWorld notebook.
   *
   * These notebooks do not use markdown `#` headings. They open with an HTML
   * header image and a block of LaTeX macro definitions, and put the title in a
   * `<b>` tag — often wrapped in `<font>`. Matching only `^# ` therefore
   * returned "Untitled Lab" for 43 of 46 labs, and on the rare notebook where
   * it did match it grabbed body text ("Google ColabThe notebooks that…")
   * rather than a title.
   *
   * Strategy, in order: the first plausible `<b>`/heading, then the filename,
   * which QWorld names descriptively (QB11_IP02_Math_with_Python).
   */
  private extractTitle(notebook: Notebook, filePath?: string): string {
    const stripTags = (html: string) =>
      html
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    for (const cell of notebook.cells) {
      if (cell.cell_type !== "markdown") continue;
      const content = cell.source.join("");

      // Skip the LaTeX macro preamble, which contains no prose.
      const candidates = [
        ...content.matchAll(/<b>([\s\S]{3,140}?)<\/b>/gi),
        ...content.matchAll(/<h[1-3][^>]*>([\s\S]{3,140}?)<\/h[1-3]>/gi),
        ...content.matchAll(/^#{1,3}\s+(.{3,140})$/gm),
      ];

      for (const match of candidates) {
        const text = stripTags(match[1]);
        // Reject boilerplate and macro noise.
        if (!text || text.length < 4) continue;
        if (/newcommand|qworld\.net|^\$|href=/i.test(text)) continue;
        // "Solutions for X" is a real title; keep it but tidy the spacing.
        return text.replace(/\s*:\s*$/, "").slice(0, 160);
      }
    }

    if (filePath) {
      // QB11_IP02_Math_with_Python.ipynb -> "Math with Python"
      const base = filePath.split("/").pop()?.replace(/\.ipynb$/i, "") ?? "";
      const humanised = base
        .replace(/^[A-Z]{1,3}\d{1,2}[_-]?/, "")   // QB11_
        .replace(/^[A-Z]{1,3}\d{1,2}[_-]?/, "")   // IP02_
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (humanised.length >= 4) return humanised;
    }

    return "Untitled Lab";
  }

  private extractDescription(notebook: Notebook): string {
    // Get first paragraph after title
    for (const cell of notebook.cells) {
      if (cell.cell_type === "markdown") {
        const content = cell.source.join("");
        // Remove title and get first paragraph
        const withoutTitle = content.replace(/^#\s+.+$/m, "").trim();
        const firstParagraph = withoutTitle.split("\n\n")[0];
        if (firstParagraph && firstParagraph.length > 10) {
          return firstParagraph.trim();
        }
      }
    }
    return "";
  }

  private extractMarkdown(notebook: Notebook): string {
    const markdownCells = notebook.cells
      .filter((cell) => cell.cell_type === "markdown")
      .map((cell) => cell.source.join(""));

    return markdownCells.join("\n\n");
  }

  private extractCode(notebook: Notebook): { starterCode: string; solutionCode?: string } {
    const codeCells = notebook.cells.filter((cell) => cell.cell_type === "code");

    // Separate starter code from solutions
    const starterCells: string[] = [];
    const solutionCells: string[] = [];

    for (const cell of codeCells) {
      const code = cell.source.join("");

      // Skip cells that are clearly outputs or tests
      if (code.includes("# Solution") || code.includes("### Solution")) {
        solutionCells.push(code);
      } else if (!code.includes("# Test") && !code.includes("print(")) {
        // Include setup code and exercise stubs
        starterCells.push(code);
      }
    }

    const starterCode = starterCells.join("\n\n");
    const solutionCode = solutionCells.length > 0 ? solutionCells.join("\n\n") : undefined;

    return { starterCode, solutionCode };
  }

  private isExerciseNotebook(filePath: string, notebook: Notebook): boolean {
    const fileName = path.basename(filePath);

    // Check file name patterns
    if (
      fileName.includes("Exercise") ||
      fileName.includes("Problem") ||
      fileName.toLowerCase().includes("task")
    ) {
      return true;
    }

    // Check for exercise markers in content
    const content = JSON.stringify(notebook).toLowerCase();
    return content.includes("exercise") || content.includes("task");
  }

  private extractHints(notebook: Notebook): string[] {
    const hints: string[] = [];

    for (const cell of notebook.cells) {
      if (cell.cell_type === "markdown") {
        const content = cell.source.join("");

        // Look for hint patterns
        const hintMatches = content.matchAll(/\*\*Hint[:\s]*\*\*\s*(.+?)(?:\n|$)/gi);
        for (const match of hintMatches) {
          hints.push(match[1].trim());
        }
      }
    }

    return hints;
  }

  private extractTopics(notebook: Notebook, filePath: string): string[] {
    const topics: string[] = [];
    const fileName = path.basename(filePath);

    // Extract from filename
    if (fileName.includes("Hadamard")) topics.push("Hadamard Gate");
    if (fileName.includes("Grover")) topics.push("Grover's Algorithm");
    if (fileName.includes("Shor")) topics.push("Shor's Algorithm");
    if (fileName.includes("Deutsch")) topics.push("Deutsch-Jozsa Algorithm");
    if (fileName.includes("Bernstein")) topics.push("Bernstein-Vazirani Algorithm");
    if (fileName.includes("Simon")) topics.push("Simon's Algorithm");
    if (fileName.includes("QFT") || fileName.includes("Fourier"))
      topics.push("Quantum Fourier Transform");
    if (fileName.includes("Teleportation")) topics.push("Quantum Teleportation");
    if (fileName.includes("Entanglement")) topics.push("Entanglement");
    if (fileName.includes("Bloch")) topics.push("Bloch Sphere");

    // Extract from content
    const content = JSON.stringify(notebook).toLowerCase();
    if (content.includes("superposition") && !topics.includes("Superposition"))
      topics.push("Superposition");
    if (content.includes("measurement") && !topics.includes("Measurement"))
      topics.push("Measurement");

    return topics;
  }

  async parseDirectory(dirPath: string): Promise<Map<string, ParsedLab>> {
    const labsMap = new Map<string, ParsedLab>();
    const files = await fs.readdir(dirPath, { recursive: true });

    for (const file of files) {
      if (typeof file === "string" && file.endsWith(".ipynb")) {
        const fullPath = path.join(dirPath, file);
        try {
          const parsed = await this.parseNotebook(fullPath);
          labsMap.set(file, parsed);
        } catch (error) {
          console.error(`Failed to parse ${file}:`, error);
        }
      }
    }

    return labsMap;
  }
}

export const notebookParser = new NotebookParser();
