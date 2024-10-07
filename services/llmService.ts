export enum LLMRequestType {
  STORY_ANALYSIS = 'STORY_ANALYSIS',
  IDENTIFY_RELEVANT_FILES = 'IDENTIFY_RELEVANT_FILES', // Add this line
}

export function generatePrompt(type: LLMRequestType, content: string): string {
  switch (type) {
    case LLMRequestType.STORY_ANALYSIS:
      return content; // The content is already formatted as a prompt in the storyChat.ts file
    case LLMRequestType.IDENTIFY_RELEVANT_FILES:
      return content;
    default:
      throw new Error(`Unsupported request type: ${type}`);
  }
}
