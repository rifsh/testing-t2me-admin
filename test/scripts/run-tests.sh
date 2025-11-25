#!/bin/bash

# =========================================================
#     OPTIMIZED REACT TEST RUNNER WITH COVERAGE
# =========================================================

set -e  # Exit immediately if a command exits with non-zero status

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Logging functions
log_header() {
    echo -e "\n${BOLD}${BLUE}=========================================================${NC}"
    echo -e "${BOLD}${BLUE}$1${NC}"
    echo -e "${BOLD}${BLUE}=========================================================${NC}\n"
}

log_step() {
    echo -e "${CYAN}→${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_error() {
    echo -e "${RED}❌${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_info() {
    echo -e "${MAGENTA}ℹ${NC} $1"
}

# Cleanup function
cleanup() {
    if [ $? -ne 0 ]; then
        log_error "Script terminated with errors"
    fi
}
trap cleanup EXIT

# =========================================================
# INITIALIZE
# =========================================================
log_header "REACT TEST RUNNER - INITIALIZATION"

# Get script directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( dirname "$( dirname "$SCRIPT_DIR" )" )"

log_step "Changing to project root directory..."
cd "$PROJECT_ROOT" || {
    log_error "Failed to navigate to project root: $PROJECT_ROOT"
    exit 1
}
log_success "Working directory: ${YELLOW}$PROJECT_ROOT${NC}"

# =========================================================
# VALIDATE PROJECT STRUCTURE
# =========================================================
log_header "VALIDATION CHECKS"

log_step "Checking for package.json..."
if [ ! -f "$PROJECT_ROOT/package.json" ]; then
    log_error "package.json not found in project root"
    exit 1
fi
log_success "package.json found"

log_step "Checking for node_modules..."
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
    log_warning "node_modules not found - will install dependencies"
    NEEDS_INSTALL=true
else
    log_success "node_modules directory exists"
    NEEDS_INSTALL=false
fi

log_step "Checking for Jest configuration..."
if grep -q '"test":' "$PROJECT_ROOT/package.json"; then
    log_success "Test script found in package.json"
else
    log_error "No test script found in package.json"
    exit 1
fi

# =========================================================
# DEPENDENCY MANAGEMENT
# =========================================================
log_header "DEPENDENCY MANAGEMENT"

if [ "$NEEDS_INSTALL" = true ] || [ "$1" = "--fresh" ]; then
    log_step "Installing dependencies (npm ci)..."
    
    # Remove existing node_modules if --fresh flag is used
    if [ "$1" = "--fresh" ]; then
        log_warning "Fresh install requested - removing node_modules..."
        rm -rf node_modules package-lock.json
    fi
    
    npm ci --silent --no-audit 2>&1 | tee /tmp/npm-install.log
    
    if [ ${PIPESTATUS[0]} -ne 0 ]; then
        log_error "Dependency installation failed"
        cat /tmp/npm-install.log
        exit 1
    fi
    log_success "Dependencies installed successfully"
else
    log_info "Skipping dependency installation (use --fresh to force reinstall)"
fi

# =========================================================
# PRE-TEST CHECKS
# =========================================================
log_header "PRE-TEST ENVIRONMENT CHECKS"

log_step "Node version: $(node --version)"
log_step "NPM version: $(npm --version)"

# Check for test files
log_step "Scanning for test files..."
TEST_FILES=$(find src -name "*.test.js" -o -name "*.test.jsx" -o -name "*.spec.js" -o -name "*.spec.jsx" 2>/dev/null | wc -l)
if [ "$TEST_FILES" -eq 0 ]; then
    log_warning "No test files found in src directory"
    log_info "Looking for test files in any location..."
    TEST_FILES=$(find . -path ./node_modules -prune -o -name "*.test.js" -o -name "*.test.jsx" -o -name "*.spec.js" -o -name "*.spec.jsx" 2>/dev/null | wc -l)
fi
log_info "Found ${YELLOW}$TEST_FILES${NC} test file(s)"

# =========================================================
# RUN TESTS (WITHOUT COVERAGE FIRST)
# =========================================================
log_header "RUNNING TEST SUITE"

log_step "Executing all tests..."
echo ""

# Run tests without coverage first for faster feedback
CI=true npm test -- --watchAll=false --verbose --no-coverage 2>&1 | tee /tmp/test-output.log

TEST_EXIT_CODE=${PIPESTATUS[0]}

echo ""

if [ $TEST_EXIT_CODE -ne 0 ]; then
    log_error "TEST SUITE FAILED"
    echo ""
    log_info "Failed test summary:"
    grep -A 5 "FAIL" /tmp/test-output.log || true
    echo ""
    log_header "❌ TESTS FAILED - EXITING WITHOUT COVERAGE"
    exit $TEST_EXIT_CODE
else
    log_success "All tests passed!"
fi

# =========================================================
# RUN COVERAGE ANALYSIS (ONLY IF TESTS PASSED)
# =========================================================
log_header "COVERAGE ANALYSIS"

log_step "Running tests with coverage..."
echo ""

CI=true npm test -- --coverage --watchAll=false --verbose --coverageReporters="text" "text-summary" "lcov" "html" 2>&1 | tee /tmp/coverage-output.log

COVERAGE_EXIT_CODE=${PIPESTATUS[0]}

echo ""

if [ $COVERAGE_EXIT_CODE -ne 0 ]; then
    log_error "Coverage analysis failed"
    exit $COVERAGE_EXIT_CODE
fi

# =========================================================
# COVERAGE REPORT SUMMARY
# =========================================================
log_header "COVERAGE SUMMARY"

if [ -f "coverage/coverage-summary.json" ]; then
    log_info "Detailed coverage report generated at: ${YELLOW}coverage/lcov-report/index.html${NC}"
fi

# Extract coverage summary from output
if grep -q "All files" /tmp/coverage-output.log; then
    echo ""
    grep -A 10 "All files" /tmp/coverage-output.log | head -15
    echo ""
fi

# =========================================================
# COVERAGE THRESHOLDS CHECK (OPTIONAL)
# =========================================================
log_step "Checking coverage thresholds..."

# Extract coverage percentages
COVERAGE_PERCENT=$(grep "All files" /tmp/coverage-output.log | awk '{print $4}' | tr -d '%' || echo "0")

if [ -n "$COVERAGE_PERCENT" ] && [ "$COVERAGE_PERCENT" != "0" ]; then
    if (( $(echo "$COVERAGE_PERCENT >= 80" | bc -l) )); then
        log_success "Coverage is ${GREEN}${COVERAGE_PERCENT}%${NC} (Above 80% threshold)"
        elif (( $(echo "$COVERAGE_PERCENT >= 60" | bc -l) )); then
        log_warning "Coverage is ${YELLOW}${COVERAGE_PERCENT}%${NC} (Consider increasing to 80%)"
    else
        log_warning "Coverage is ${RED}${COVERAGE_PERCENT}%${NC} (Below recommended 60% threshold)"
    fi
else
    log_info "Coverage percentage could not be determined"
fi

# =========================================================
# CLEANUP AND SUMMARY
# =========================================================
log_header "TEST EXECUTION COMPLETE"

log_success "All tests passed with coverage analysis"
log_info "Total test files: ${YELLOW}$TEST_FILES${NC}"
log_info "Coverage report: ${YELLOW}$PROJECT_ROOT/coverage/lcov-report/index.html${NC}"
log_info "Logs saved to: ${YELLOW}/tmp/test-output.log, /tmp/coverage-output.log${NC}"

echo ""
log_header "✅ SUCCESS - ALL CHECKS PASSED"

exit 0