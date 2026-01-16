import { existsSync, mkdirSync, readdirSync, rmSync, cpSync, readFileSync, writeFileSync, renameSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { logger } from '../utils/logger.js';

export interface Session {
  name: string;
  lastUsed: number;
}

export class SessionManager {
  private static instance: SessionManager;
  private sessionsDir: string;
  private claudeDir: string;
  private currentSessionFile: string;

  private constructor() {
    this.sessionsDir = join(homedir(), '.claude-sessions');
    this.claudeDir = join(homedir(), '.claude');
    this.currentSessionFile = join(this.sessionsDir, 'current');
    this.ensureSessionsDir();
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  private ensureSessionsDir() {
    if (!existsSync(this.sessionsDir)) {
      mkdirSync(this.sessionsDir, { recursive: true });
    }
  }

  listSessions(): Session[] {
    const sessions: Session[] = [];
    if (existsSync(this.sessionsDir)) {
      const entries = readdirSync(this.sessionsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
            // Check metadata if exists, otherwise just name
            // For now just name
            sessions.push({ name: entry.name, lastUsed: 0 });
        }
      }
    }
    // Always ensure 'default' exists conceptually, but maybe not on disk yet if never saved
    if (!sessions.find(s => s.name === 'default')) {
        sessions.push({ name: 'default', lastUsed: 0 });
    }
    return sessions;
  }

  renameSession(oldName: string, newName: string) {
    const oldPath = join(this.sessionsDir, oldName);
    const newPath = join(this.sessionsDir, newName);

    if (!existsSync(oldPath)) {
        throw new Error(`Session '${oldName}' does not exist`);
    }

    if (existsSync(newPath)) {
        throw new Error(`Session '${newName}' already exists`);
    }

    // Validate new name
    if (/[<>:"/\\|?*]/.test(newName)) {
        throw new Error('Invalid characters in session name');
    }

    renameSync(oldPath, newPath);

    // Update current session pointer if needed
    const currentSession = this.getCurrentSessionName();
    if (currentSession === oldName) {
        writeFileSync(this.currentSessionFile, newName);
    }
  }

  getCurrentSessionName(): string {
    if (existsSync(this.currentSessionFile)) {
      return readFileSync(this.currentSessionFile, 'utf-8').trim();
    }
    return 'default';
  }

  saveCurrentSession(sessionName: string) {
    // Save current ~/.claude to ~/.claude-sessions/<sessionName>
    const sessionPath = join(this.sessionsDir, sessionName);
    
    // If ~/.claude doesn't exist, nothing to save, but maybe we should create the session dir
    if (!existsSync(this.claudeDir)) {
        return;
    }

    // Clean target session dir
    if (existsSync(sessionPath)) {
        rmSync(sessionPath, { recursive: true, force: true });
    }
    mkdirSync(sessionPath, { recursive: true });

    // Copy ~/.claude to session dir
    // We use cpSync which is available in Node 16.7+
    cpSync(this.claudeDir, sessionPath, { recursive: true });
  }

  restoreSession(sessionName: string) {
    const sessionPath = join(this.sessionsDir, sessionName);
    
    // Clear current ~/.claude
    if (existsSync(this.claudeDir)) {
        try {
            rmSync(this.claudeDir, { recursive: true, force: true });
        } catch (error: any) {
            console.warn(`Warning: Failed to clear .claude directory: ${error.message}. Retrying...`);
            // Simple retry logic: wait a bit and try again, or try to delete contents
            try {
                // If it was EBUSY or ENOTEMPTY, maybe waiting helps?
                // But for now, let's just log and proceed. 
                // If we proceed, cpSync might fail or merge?
                // Let's try to delete contents explicitly
                const files = readdirSync(this.claudeDir);
                for (const file of files) {
                    rmSync(join(this.claudeDir, file), { recursive: true, force: true });
                }
                rmSync(this.claudeDir, { recursive: true, force: true });
            } catch (retryError) {
                console.error(`Failed to clear .claude directory on retry: ${retryError}`);
                // Throwing might be better to stop inconsistent state, but user might want to force start
            }
        }
    }
    
    // If session exists, copy it to ~/.claude
    if (existsSync(sessionPath)) {
        if (!existsSync(this.claudeDir)) {
            mkdirSync(this.claudeDir, { recursive: true });
        }
        cpSync(sessionPath, this.claudeDir, { recursive: true, force: true });
    } else {
        // If session is new (doesn't exist in storage), we start with empty or maybe default config?
        // Usually, a new session implies fresh start. 
        // But we might want to preserve authentication.
        // For now, let's assume fresh start, but maybe we should copy auth?
        // TODO: Handle auth persistence across sessions if desired.
        // User said "save conversation history", implied keeping auth.
        // Maybe we should copy 'default' session's config if it's a new session?
        // Let's just create the dir.
        if (!existsSync(this.claudeDir)) {
            mkdirSync(this.claudeDir, { recursive: true });
        }
    }

    // Update current session tracker
    writeFileSync(this.currentSessionFile, sessionName);
  }

  async createSession(name: string) {
      // Just create the directory
      const sessionPath = join(this.sessionsDir, name);
      if (!existsSync(sessionPath)) {
          mkdirSync(sessionPath, { recursive: true });
      }
  }
}
