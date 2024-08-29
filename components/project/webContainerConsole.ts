type WebContainer = any; // We'll use 'any' for now to avoid type errors

export class WebContainerConsole {
  public webcontainer: WebContainer | null = null;
  private statusCallback: (status: string) => void;
  private currentProcess: any = null;  // Store the current running process

  constructor(statusCallback: (status: string) => void) {
    this.statusCallback = statusCallback;
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
      this.currentProcess = await this.webcontainer.spawn('npm', ['run', 'dev']);
      this.currentProcess.output.pipeTo(new WritableStream({
        write: (chunk) => {
          const trimmedChunk = chunk.trim();
          if (trimmedChunk) {
            this.statusCallback(`Server: ${trimmedChunk}`);
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
}
