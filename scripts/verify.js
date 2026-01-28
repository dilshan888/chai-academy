#!/usr/bin/env node

/**
 * ChAI Academy - System Verification Script
 * 
 * This script performs automated checks to verify the system is properly configured.
 * Run with: node scripts/verify.js
 */

const http = require('http');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkMark(passed) {
    return passed ? '✅' : '❌';
}

async function checkCommand(command, description) {
    try {
        await execPromise(command);
        log(`${checkMark(true)} ${description}`, 'green');
        return true;
    } catch (error) {
        log(`${checkMark(false)} ${description}`, 'red');
        log(`   Error: ${error.message}`, 'red');
        return false;
    }
}

async function checkEndpoint(path, description) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET',
            timeout: 5000,
        };

        const req = http.request(options, (res) => {
            const success = res.statusCode === 200;
            log(`${checkMark(success)} ${description} (Status: ${res.statusCode})`, success ? 'green' : 'red');
            resolve(success);
        });

        req.on('error', (error) => {
            log(`${checkMark(false)} ${description}`, 'red');
            log(`   Error: ${error.message}`, 'red');
            resolve(false);
        });

        req.on('timeout', () => {
            req.destroy();
            log(`${checkMark(false)} ${description} (Timeout)`, 'red');
            resolve(false);
        });

        req.end();
    });
}

async function runVerification() {
    log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
    log('║     ChAI Academy - System Verification Script         ║', 'cyan');
    log('╚════════════════════════════════════════════════════════╝\n', 'cyan');

    const results = {
        passed: 0,
        failed: 0,
        total: 0,
    };

    // 1. Check Node.js version
    log('\n📦 Checking Dependencies...', 'blue');
    const nodeCheck = await checkCommand('node --version', 'Node.js installed');
    results.total++;
    if (nodeCheck) results.passed++;
    else results.failed++;

    // 2. Check npm
    const npmCheck = await checkCommand('npm --version', 'npm installed');
    results.total++;
    if (npmCheck) results.passed++;
    else results.failed++;

    // 3. Check if node_modules exists
    const modulesCheck = await checkCommand('test -d node_modules', 'node_modules directory exists');
    results.total++;
    if (modulesCheck) results.passed++;
    else results.failed++;

    // 4. Check TypeScript
    log('\n🔷 Checking TypeScript...', 'blue');
    const tscCheck = await checkCommand('npx tsc --version', 'TypeScript compiler available');
    results.total++;
    if (tscCheck) results.passed++;
    else results.failed++;

    // 5. Check Prisma
    log('\n🗄️  Checking Prisma...', 'blue');
    const prismaCheck = await checkCommand('npx prisma --version', 'Prisma CLI available');
    results.total++;
    if (prismaCheck) results.passed++;
    else results.failed++;

    // 6. Validate Prisma schema
    const schemaCheck = await checkCommand('npx prisma validate', 'Prisma schema is valid');
    results.total++;
    if (schemaCheck) results.passed++;
    else results.failed++;

    // 7. Check environment file
    log('\n🔐 Checking Environment...', 'blue');
    const envCheck = await checkCommand('test -f .env', '.env file exists');
    results.total++;
    if (envCheck) results.passed++;
    else results.failed++;

    // 8. Check if dev server is running
    log('\n🌐 Checking Development Server...', 'blue');
    log('   (Make sure to run "npm run dev" in another terminal)', 'yellow');

    await new Promise(resolve => setTimeout(resolve, 1000));

    const healthCheck = await checkEndpoint('/api/health', 'Health check endpoint');
    results.total++;
    if (healthCheck) results.passed++;
    else results.failed++;

    const verifyCheck = await checkEndpoint('/api/verify', 'Verification endpoint');
    results.total++;
    if (verifyCheck) results.passed++;
    else results.failed++;

    const testPageCheck = await checkEndpoint('/test', 'Test page');
    results.total++;
    if (testPageCheck) results.passed++;
    else results.failed++;

    // Summary
    log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
    log('║                    VERIFICATION SUMMARY                ║', 'cyan');
    log('╚════════════════════════════════════════════════════════╝\n', 'cyan');

    const percentage = Math.round((results.passed / results.total) * 100);
    const allPassed = results.failed === 0;

    log(`Total Checks: ${results.total}`, 'blue');
    log(`Passed: ${results.passed}`, 'green');
    log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
    log(`Success Rate: ${percentage}%\n`, allPassed ? 'green' : 'yellow');

    if (allPassed) {
        log('🎉 All checks passed! System is ready.', 'green');
    } else {
        log('⚠️  Some checks failed. Please review the errors above.', 'yellow');
    }

    log('\n💡 Next Steps:', 'blue');
    if (!allPassed) {
        log('   1. Fix the failed checks', 'yellow');
        log('   2. Run this script again', 'yellow');
    }
    log('   3. Visit http://localhost:3000/test for detailed status', 'cyan');
    log('   4. Start building features!\n', 'cyan');

    process.exit(allPassed ? 0 : 1);
}

// Run the verification
runVerification().catch((error) => {
    log(`\n❌ Verification script failed: ${error.message}`, 'red');
    process.exit(1);
});
