//
//  MEDIAN CORE
//  2025
//      ~ Amenoke
//


class MedianCore {
    constructor() {


//////////////////////////////////////////////////
// [INITIAL CONFIGURATION]
//////////////////////////////////////////////////


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


//////////////////////////////////////////////////
// [COMPILERS REGISTRY]
//////////////////////////////////////////////////


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
                    jit: false,
                    packages: {
                        available: ['directint', 'directint-sys', 'directint-api', 'di-ext', 'direct-actu'],
                        installed: ['directint', 'directint-sys', 'directint-api'],
                        active: ['directint', 'directint-sys', 'directint-api']
                    }
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


//////////////////////////////////////////////////
// [SYSTEM STATE]
//////////////////////////////////////////////////


        this.memoryUsage = 0;
        this.compilationCache = {};
        this.lastError = null;
        this.systemCommands = ['~compil', '~config', '~memory', '~reset', '~dipkg', '~i'];
    }


//////////////////////////////////////////////////
// [CORE METHODS]
//////////////////////////////////////////////////


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


//////////////////////////////////////////////////
// [SYSTEM COMMANDS HANDLERS]
//////////////////////////////////////////////////


    processSystemCommand(command) {
        const parts = command.split(' ');
        const cmd = parts[0];
        const args = parts.slice(1);
        if (this.config.compiler === 'DI') {
            const diOptions = this.compilers['DI'].options;
            if (!diOptions.packages.installed.includes('directint-sys') ||
                !diOptions.packages.active.includes('directint-sys')) {
                if (cmd !== '~compil') {
                    throw new Error('System.exception => Direct Interpreter in restricted mode (only compiler change allowed)');
                }
                }
        }
        switch (cmd) {
            case '~compil':
                return this.handleCompilerCommand(args);
            case '~config':
                return this.handleConfigCommand(args);
            case '~memory':
                return this.handleMemoryCommand();
            case '~reset':
                return this.handleResetCommand();
            case '~dipkg':
                return this.handleDIPackageCommand(args);
            case '~i':
                return this.handleInfoCommand();
            default:
                throw new Error(`System.exception => ${cmd}`);
        }
    }


//////////////////////////////////////////////////
// [COMPILER IMPLEMENTATIONS]
//////////////////////////////////////////////////


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
        const diOptions = this.compilers['DI'].options;
        if (!diOptions.packages.installed.includes('directint') ||
            !diOptions.packages.active.includes('directint')) {
            throw new Error('DI Compiler.exception => Required package "directint" is missing or inactive');
            }
            let result = '';
        if (diOptions.packages.active.includes('direct-actu')) {
            result += this.getPackageInfoWindow();
        }
        const useHex = !diOptions.packages.installed.includes('directint-api') ||
        !diOptions.packages.active.includes('directint-api');
        if (useHex) {
            result += this.convertToHex(code);
        } else {
            result += code;
        }
        return result;
    }
    convertToHex(text) {
        let hex = '';
        for (let i = 0; i < text.length; i++) {
            hex += text.charCodeAt(i).toString(16).padStart(2, '0') + ' ';
        }
        return `${hex.trim()}`;
    }
    processWithFlexibleCompiler(code) {
        return `${code}`;
    }
    processWithDirectCompiler(code) {
        return `${code}`;
    }


//////////////////////////////////////////////////
// [COMPILER MANAGEMENT]
//////////////////////////////////////////////////


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
    listAvailableCompilers() {
        let result = 'Available compilers:\n';
        for (const [key, comp] of Object.entries(this.compilers)) {
            result += `  ${key}: ${comp.name}\n    ${comp.description}\n`;
        }
        return result.trim();
    }


//////////////////////////////////////////////////
// [CONFIGURATION MANAGEMENT]
//////////////////////////////////////////////////


    handleConfigCommand(args) {
        const diOptions = this.compilers['DI']?.options;
        const canReadConfig = diOptions?.packages?.installed?.includes('di-ext') &&
        diOptions?.packages?.active?.includes('di-ext');
        if (!canReadConfig && this.config.compiler === 'DI') {
            throw new Error('Configuration.exception => "di-ext" package required for config operations');
        }
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


//////////////////////////////////////////////////
// [DI PACKAGE MANAGEMENT]
//////////////////////////////////////////////////


    handleDIPackageCommand(args) {
        if (this.config.compiler !== 'DI') {
            throw new Error('DI Package manager is only available for DI compiler');
        }
        if (args.length === 0) {
            return this.listDIPackages();
        }
        const command = args[0];
        const packageName = args[1];
        switch (command) {
            case 'install':
                return this.installDIPackage(packageName);
            case 'uninstall':
                return this.uninstallDIPackage(packageName);
            case 'activate':
                return this.activateDIPackage(packageName);
            case 'deactivate':
                return this.deactivateDIPackage(packageName);
            case 'list':
                return this.listDIPackages();
            case 'available':
                return this.listAvailableDIPackages();
            default:
                throw new Error(`DI Package manager exception: Unknown command '${command}'`);
        }
    }
    listDIPackages() {
        const diOptions = this.compilers['DI'].options;
        let result = 'DI Packages:\n';
        result += `Available: ${diOptions.packages.available.join(', ')}\n`;
        result += `Installed: ${diOptions.packages.installed.join(', ')}\n`;
        result += `Active: ${diOptions.packages.active.join(', ')}\n`;
        return result;
    }
    listAvailableDIPackages() {
        return `Available DI Packages:\n${this.compilers['DI'].options.packages.available.join('\n')}`;
    }
    installDIPackage(packageName) {
        const diOptions = this.compilers['DI'].options;
        if (!diOptions.packages.available.includes(packageName)) {
            throw new Error(`DI Package exception: Package '${packageName}' not available`);
        }
        if (diOptions.packages.installed.includes(packageName)) {
            return `Package '${packageName}' is already installed`;
        }
        diOptions.packages.installed.push(packageName);
        return `Package '${packageName}' installed successfully`;
    }
    uninstallDIPackage(packageName) {
        const diOptions = this.compilers['DI'].options;
        if (!diOptions.packages.installed.includes(packageName)) {
            return `Package '${packageName}' is not installed`;
        }
        diOptions.packages.installed = diOptions.packages.installed.filter(pkg => pkg !== packageName);
        diOptions.packages.active = diOptions.packages.active.filter(pkg => pkg !== packageName);
        return `Package '${packageName}' uninstalled successfully`;
    }
    activateDIPackage(packageName) {
        const diOptions = this.compilers['DI'].options;
        if (!diOptions.packages.installed.includes(packageName)) {
            throw new Error(`DI Package exception: Package '${packageName}' is not installed`);
        }
        if (diOptions.packages.active.includes(packageName)) {
            return `Package '${packageName}' is already active`;
        }
        diOptions.packages.active.push(packageName);
        return `Package '${packageName}' activated successfully`;
    }
    deactivateDIPackage(packageName) {
        const diOptions = this.compilers['DI'].options;
        if (!diOptions.packages.active.includes(packageName)) {
            return `Package '${packageName}' is not active`;
        }
        diOptions.packages.active = diOptions.packages.active.filter(pkg => pkg !== packageName);
        return `Package '${packageName}' deactivated successfully`;
    }


//////////////////////////////////////////////////
// [INFO COMMAND IMPLEMENTATION]
//////////////////////////////////////////////////


    handleInfoCommand() {
        // Check if direct-actu package is installed and active
        const diOptions = this.compilers['DI'].options;
        if (this.config.compiler !== 'DI' ||
            !diOptions.packages.installed.includes('direct-actu') ||
            !diOptions.packages.active.includes('direct-actu')) {
            throw new Error('Info.exception => "direct-actu" package required for info operations');
            }

            return this.getPackageInfoWindow();
    }
    getPackageInfoWindow() {
        const diOptions = this.compilers['DI'].options;
        let info = `=== DI PACKAGE INFORMATION ===\n\n`;
        info += `[Available Packages]\n`;
        info += diOptions.packages.available.map(pkg => `  ${pkg}`).join('\n') + '\n\n';
        info += `[Installed Packages]\n`;
        info += diOptions.packages.installed.map(pkg => {
            const isActive = diOptions.packages.active.includes(pkg);
            return `  ${pkg}${isActive ? ' (active)' : ''}`;
        }).join('\n') + '\n\n';
        info += `[System Status]\n`;
        info += `  Compiler: ${this.config.compiler || 'none'}\n`;
        info += `  Memory: ${(this.memoryUsage / (1024 * 1024)).toFixed(2)}MB used\n`;
        info += `  Last Error: ${this.lastError || 'none'}\n\n`;
        info += `[Commands]\n`;
        info += `  ~i - Show this information\n`;
        info += `  Other system commands: ${this.systemCommands.join(', ')}\n`;
        info += `=================================`;
        return info;
    }


//////////////////////////////////////////////////
// [SYSTEM UTILITIES]
//////////////////////////////////////////////////


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
    handleResetCommand() {
        this.memoryUsage = 0;
        this.compilationCache = {};
        return 'System state reset';
    }
    resetMemoryUsage() {
        this.memoryUsage = 0;
    }
    getLastError() {
        return this.lastError;
    }
}
