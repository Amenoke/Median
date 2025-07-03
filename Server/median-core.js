//
//  MEDIAN CORE
//  2025
//      ~ Amenoke
//

class MedianCore {

    //
    // [STANDARD CONFIGURATION]
    //

    constructor() {
        this.config = {
            compiler: null,
            compilerOptions: {
                optimizationLevel: 1,
                strictMode: false,
                debugSymbols: true
            },
            bash: {
                memoryLimitMB: 512,
                timeoutMs: 10000,
                maxOutputLines: 1000,
                historySize: 50,
                theme: 'dark',
                autoScroll: true
            },
            configuration: {
                key: '1.0.0'
            }
        };

        //
        // [COMPILERS CONFIGURATION]
        //

        this.compilers = {
            'null': {
                name: 'Null Compiler',
                description: 'No compilation available',
                options: {}
            },
            'DI': {
                name: 'Direct Interpreter',
                description: 'Executes code directly without compilation',
                options: {
                    strictMode: true,
                    jit: false
                }
            },
            'FC': {
                name: 'Flexible Compiler',
                description: 'Balanced compilation with optimizations',
                options: {
                    optimizationLevel: 2,
                    inlineFunctions: true
                }
            },
            'DC': {
                name: 'Direct Compiler',
                description: 'Fast compilation with minimal optimizations',
                options: {
                    fastBuild: true,
                    debugSymbols: false
                }
            }
        };

        //
        // [SYSTEM CONFIGURATION]
        //

        this.memoryUsage = 0;
        this.compilationCache = {};
        this.lastError = null;
    }

    //
    // [COMMAND PROCESSING]
    //

    processCommand(command) {
        try {
            this.checkMemory();
            this.lastError = null;

            if (command.startsWith('~')) {
                return this.processSystemCommand(command);
            }

            if (this.config.compiler === null) {
                throw new Error('Host.exception => No compiler set (use ~compil to set)');
            }

            return this.processCodeCommand(command);
        } catch (e) {
            this.lastError = e.message;
            throw e;
        }
    }

    //
    // [SYSTEM COMMANDS]
    //

    processSystemCommand(command) {
        const parts = command.split(' ');
        const cmd = parts[0];
        const args = parts.slice(1);

        switch (cmd) {
            case '~compil':
                return this.handleCompilerCommand(args);
            case '~config':
                return this.handleConfigCommand(args);
            case '~memory':
                return this.handleMemoryCommand();
            case '~reset':
                return this.handleResetCommand();
            default:
                throw new Error(`System.exception => ${cmd}`);
        }
    }

    //
    // [COMPILER HANDLING]
    //

    handleCompilerCommand(args) {
        if (args.length === 0) {
            return this.listAvailableCompilers();
        }

        const compiler = args[0].toUpperCase();

        if (compiler === 'NULL') {
            this.config.compiler = null;
            this.config.compilerOptions = {};
            return 'Compiler set to null (no compiler active)';
        }

        if (!this.compilers[compiler]) {
            throw new Error(`Compiler.exception => ${compiler}`);
        }

        this.config.compiler = compiler;
        this.config.compilerOptions = {
            ...this.compilers[compiler].options
        };
        return `${this.compilers[compiler].name} $$ merged (\n${this.compilers[compiler].description})`;
    }

    //
    // [CONFIGURATION HANDLING]
    //

    handleConfigCommand(args) {
        if (args.length === 0) {
            return this.getConfigString();
        }

        if (args[0] === 'set' && args.length >= 3) {
            const path = args[1].split('.');
            const value = args.slice(2).join(' ');
            return this.setConfigValue(path, value);
        }

        throw new Error('Configuration $$ exception');
    }

    setConfigValue(path, value) {
        let current = this.config;

        for (let i = 0; i < path.length - 1; i++) {
            if (!current[path[i]]) {
                current[path[i]] = {};
            }
            current = current[path[i]];
        }

        let finalValue;
        if (value === 'true') finalValue = true;
        else if (value === 'false') finalValue = false;
        else if (!isNaN(value) && value.trim() !== '') finalValue = Number(value);
        else finalValue = value;

        current[path[path.length - 1]] = finalValue;
        return `Config updated: ${path.join('.')} = ${finalValue}`;
    }

    //
    // [MEMORY MANAGEMENT]
    //

    handleMemoryCommand() {
        const usedMB = (this.memoryUsage / (1024 * 1024)).toFixed(2);
        const limitMB = this.config.bash.memoryLimitMB;
        const percent = (this.memoryUsage / (limitMB * 1024 * 1024) * 100).toFixed(1);
        return `Memory usage: ${usedMB} MB / ${limitMB} MB (${percent}%)`;
    }

    checkMemory() {
        if (this.memoryUsage > this.config.bash.memoryLimitMB * 1024 * 1024) {
            throw new Error(`Memory limit exceeded (${this.config.bash.memoryLimitMB}MB)`);
        }
    }

    //
    // [SYSTEM STATE]
    //

    handleResetCommand() {
        this.memoryUsage = 0;
        this.compilationCache = {};
        return 'System state reset';
    }

    //
    // [CODE PROCESSING]
    //

    processCodeCommand(command) {
        this.memoryUsage += command.length * 100;

        switch (this.config.compiler) {
            case 'DI':
                return this.processWithDirectInterpreter(command);
            case 'FC':
                return this.processWithFlexibleCompiler(command);
            case 'DC':
                return this.processWithDirectCompiler(command);
            default:
                throw new Error('Compiler.exception ~');
        }
    }

    processWithDirectInterpreter(code) {
        return `${code}`;
    }

    processWithFlexibleCompiler(code) {
        return `${code}`;
    }

    processWithDirectCompiler(code) {
        return `${code}`;
    }

    //
    // [UTILITY METHODS]
    //

    listAvailableCompilers() {
        let result = 'Available compilers:\n';
        for (const [key, comp] of Object.entries(this.compilers)) {
            result += `  ${key}: ${comp.name}\n    ${comp.description}\n`;
        }
        return result.trim();
    }

    getConfigString() {
        return `${JSON.stringify({
            compiler: this.config.compiler,
            compilerOptions: this.config.compilerOptions,
            bash: this.config.bash,
            configuration: this.config.configuration
        }, null, 2)}`;
    }

    loadConfig(config) {
        try {
            const parsed = JSON.parse(config.replace(/\/\/.*$/gm, '').trim());
            this.config = {
                ...this.config,
                ...parsed,
                bash: {
                    ...this.config.bash,
                    ...(parsed.bash || {})
                },
                compilerOptions: {
                    ...this.config.compilerOptions,
                    ...(parsed.compilerOptions || {})
                }
            };
            return true;
        } catch (e) {
            throw new Error('Invalid config format');
        }
    }

    resetMemoryUsage() {
        this.memoryUsage = 0;
    }

    getLastError() {
        return this.lastError;
    }
}
