/**
 * Simple structured logger for the application
 */
export class Logger {
    private static format(level: 'INFO' | 'WARN' | 'ERROR', message: string, context?: any) {
        const timestamp = new Date().toISOString();
        const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
        return `[${timestamp}] [${level}] ${message}${contextStr}`;
    }

    static info(message: string, context?: any) {
        console.log(this.format('INFO', message, context));
    }

    static warn(message: string, context?: any) {
        console.warn(this.format('WARN', message, context));
    }

    static error(message: string, error?: any, context?: any) {
        console.error(this.format('ERROR', message, {
            ...context,
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined
        }));
    }
}
