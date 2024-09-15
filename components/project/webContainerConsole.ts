import { LLMService, LLMRequestType } from '../../services/llmService';

type WebContainer = any; // We'll use 'any' for now to avoid type errors

export class WebContainerConsole {
  public webcontainer: WebContainer | null = null;
  private statusCallback: (status: string) => void;
  private outputCallback: ((output: string) => void) | null = null;
  private currentProcess: any = null;  // Store the current running process
  private llmService: LLMService;

  constructor(statusCallback: (status: string) => void, llmService: LLMService) {
    this.statusCallback = statusCallback;
    this.llmService = llmService;
  }

  async init() {
    this.statusCallback('Initializing WebContainer...');
    try {
      const { WebContainer } = await import('@webcontainer/api');
      this.webcontainer = await WebContainer.boot();
      this.statusCallback('WebContainer initialized successfully');
    } catch (error) {
      console.error('Failed to initialize WebContainer:', error);
      this.statusCallback(`WebContainer initialization failed: ${error}`);
      throw error;
    }
  }

  async loadFiles(files: Record<string, any>) {
    if (!this.webcontainer) {
      throw new Error('WebContainer not initialized');
    }
    this.statusCallback('Loading files into WebContainer...');
    try {
      await this.webcontainer.mount(files);
      this.statusCallback('Files loaded into WebContainer successfully');
    } catch (error) {
      console.error('Error loading files into WebContainer:', error);
      this.statusCallback(`Error loading files into WebContainer: ${error}`);
      throw error;
    }
  }

  async startServer() {
    if (!this.webcontainer) {
      throw new Error('WebContainer not initialized');
    }
    this.statusCallback('Starting development server...');
    try {
      this.currentProcess = await this.webcontainer.spawn('npx', ['next', 'dev']);
      this.currentProcess.output.pipeTo(new WritableStream({
        write: (chunk) => {
          const trimmedChunk = chunk.trim();
          if (trimmedChunk) {
            // Remove this line to avoid duplicate messages
            // this.statusCallback(`Server: ${trimmedChunk}`);
            if (this.outputCallback) {
              this.outputCallback(trimmedChunk);
            }
          }
        }
      }));
      this.statusCallback('Development server started successfully');
    } catch (error) {
      console.error('Error starting development server:', error);
      this.statusCallback(`Error starting development server: ${error}`);
      throw error;
    }
  }

  async stopServer() {
    if (this.currentProcess) {
      await this.currentProcess.kill();
      this.currentProcess = null;
      this.statusCallback('Development server stopped');
    }
  }

  async findEntryPointFile(fileStructure: string): Promise<string> {
    try {
      const simplifiedStructure = this.simplifyFileStructure(fileStructure);
      console.log('Simplified file structure:', simplifiedStructure);

      console.log('Sending request to LLM...');
      const response = await this.llmService.sendRequest(LLMRequestType.FIND_ENTRYPOINT_FILE, simplifiedStructure);
      console.log('Received response from LLM:', response);

      if (!response) {
        throw new Error('LLM returned an empty response');
      }

      const match = response.match(/<FILE_PATH>(.*?)<\/FILE_PATH>/);
      if (!match) {
        console.error('LLM response does not contain expected FILE_PATH tags:', response);
        throw new Error('Invalid response format from LLM for entry point file');
      }

      const entryPoint = match[1].trim();
      console.log('Found entry point:', entryPoint);

      if (!entryPoint) {
        throw new Error('LLM returned an empty entry point file path');
      }

      return entryPoint;
    } catch (error) {
      console.error('Error in findEntryPointFile:', error);
      if (error instanceof Error) {
        throw new Error(`Error finding entry point file: ${error.message}`);
      } else {
        throw new Error('Unknown error occurred while finding entry point file');
      }
    }
  }

  async injectEventTracker(entryPointFile: string, entryPointContent: string): Promise<{ filePath: string, content: string }> {
    try {
      const response = await this.llmService.sendRequest(
        LLMRequestType.EVENT_TRACKER_INJECTION_TO_CUSTOMER_NEXTJS_APP,
        entryPointContent
      );
      const filePathMatch = response.match(/<FILE_PATH>(.*?)<\/FILE_PATH>/);
      const contentMatch = response.match(/<UPDATED_CONTENT>([\s\S]*?)<\/UPDATED_CONTENT>/);
      
      if (!filePathMatch || !contentMatch) {
        throw new Error('Invalid response format from LLM for event tracker injection');
      }

      const filePath = filePathMatch[1].trim();
      const updatedContent = contentMatch[1].trim();

      if (filePath !== entryPointFile) {
        console.warn(`LLM suggested a different file path (${filePath}) than the original entry point (${entryPointFile}). Using the original entry point.`);
      }

      return { filePath: entryPointFile, content: updatedContent };
    } catch (error) {
      console.error('Error injecting event tracker:', error);
      throw error;
    }
  }

  async getFileContent(filePath: string): Promise<string> {
    if (!this.webcontainer) {
      throw new Error('WebContainer not initialized');
    }
    const file = await this.webcontainer.fs.readFile(filePath, 'utf-8');
    return file;
  }

  async writeFileContent(filePath: string, content: string): Promise<void> {
    if (!this.webcontainer) {
      throw new Error('WebContainer not initialized');
    }
    await this.webcontainer.fs.writeFile(filePath, content);
  }

  async getFileStructure(): Promise<string> {
    if (!this.webcontainer) {
      throw new Error('WebContainer not initialized');
    }

    const traverseDirectory = async (path: string): Promise<string> => {
      const entries = await this.webcontainer!.fs.readdir(path, { withFileTypes: true });
      let structure = '';

      for (const entry of entries) {
        if (entry.isDirectory()) {
          structure += `${path}/${entry.name}/\n`;
          structure += await traverseDirectory(`${path}/${entry.name}`);
        } else {
          structure += `${path}/${entry.name}\n`;
        }
      }

      return structure;
    };

    try {
      const fileStructure = await traverseDirectory('/');
      return fileStructure.trim();
    } catch (error) {
      console.error('Error getting file structure:', error);
      throw error;
    }
  }

  async initializeWithEventTracker(files: Record<string, any>) {
    if (!this.webcontainer) {
      throw new Error('WebContainer not initialized');
    }

    this.statusCallback('Initializing WebContainer with event tracker...');

    try {
      // Mount files
      await this.loadFiles(files);

      // Get file structure
      const fileStructure = await this.getFileStructure();

      // Find entry point file
      const entryPointFile = await this.findEntryPointFile(fileStructure);

      // Get entry point file content
      const entryPointContent = await this.getFileContent(entryPointFile);

      // Inject event tracker
      const { filePath, content: modifiedContent } = await this.injectEventTracker(entryPointFile, entryPointContent);

      // Write modified content back to the file
      await this.writeFileContent(filePath, modifiedContent);

      // Install dependencies
      await this.installDependencies();

      // Start the server
      await this.startServer();

      this.statusCallback('WebContainer initialized with event tracker successfully');
    } catch (error) {
      console.error('Error initializing WebContainer with event tracker:', error);
      this.statusCallback(`Error initializing WebContainer with event tracker: ${error}`);
      throw error;
    }
  }

  private simplifyFileStructure(fileStructure: string): string {
    const lines = fileStructure.split('\n');
    const simplifiedLines = lines
      .filter(line => {
        const path = line.trim();
        if (path.endsWith('/')) return true; // Keep all directories
        const fileName = path.split('/').pop()?.toLowerCase() || '';
        return fileName.includes('index') || fileName.includes('app') || fileName.includes('main');
      })
      .map(line => {
        const path = line.trim();
        return path.endsWith('/') ? path : path + ' (file)';
      });

    return simplifiedLines.join('\n');
  }

  async installDependencies() {
    if (!this.webcontainer) {
      throw new Error('WebContainer not initialized');
    }
    this.statusCallback('Installing dependencies...');
    try {
      const installProcess = await this.webcontainer.spawn('npm', ['install']);
      installProcess.output.pipeTo(new WritableStream({
        write: (chunk) => {
          const trimmedChunk = chunk.trim();
          if (trimmedChunk) {
            this.statusCallback(`Install: ${trimmedChunk}`);
          }
        }
      }));
      await installProcess.exit;
      this.statusCallback('Dependencies installed successfully');
    } catch (error) {
      console.error('Error installing dependencies:', error);
      this.statusCallback(`Error installing dependencies: ${error}`);
      throw error;
    }
  }

  setOutputCallback(callback: (output: string) => void) {
    this.outputCallback = callback;
  }
}

