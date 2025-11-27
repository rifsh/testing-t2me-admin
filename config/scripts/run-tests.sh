#!/bin/bash

# =========================================================
#     OPTIMIZED REACT TEST RUNNER WITH COVERAGE
# =========================================================

set -e  # Exit immediately if a command exits with non-zero status

# =========================================================
# CONFIGURATION
# =========================================================
# Set your required coverage percentage here (0-100)
REQUIRED_COVERAGE=2

# You can also set individual thresholds for different metrics
REQUIRED_STATEMENTS=80
REQUIRED_BRANCHES=75
REQUIRED_FUNCTIONS=80
REQUIRED_LINES=80

# =========================================================
# COLOR CODES
# =========================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# =========================================================
# LOGGING FUNCTIONS
# =========================================================
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
# PARSE COMMAND LINE ARGUMENTS
# =========================================================
FRESH_INSTALL=false
SKIP_COVERAGE=false
CUSTOM_COVERAGE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --fresh)
            FRESH_INSTALL=true
            shift
        ;;
        --no-coverage)
            SKIP_COVERAGE=true
            shift
        ;;
        --coverage-threshold)
            CUSTOM_COVERAGE="$2"
            shift 2
        ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --fresh                     Force fresh npm install"
            echo "  --no-coverage              Skip coverage analysis"
            echo "  --coverage-threshold NUM   Set required coverage percentage (0-100)"
            echo "  --help                     Show this help message"
            echo ""
            echo "Example: $0 --coverage-threshold 85"
            exit 0
        ;;
        *)
            log_warning "Unknown option: $1"
            shift
        ;;
    esac
done

# Override coverage threshold if provided via command line
if [ -n "$CUSTOM_COVERAGE" ]; then
    REQUIRED_COVERAGE=$CUSTOM_COVERAGE
    log_info "Using custom coverage threshold: ${YELLOW}${REQUIRED_COVERAGE}%${NC}"
fi

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

# Display configuration
log_info "Required Coverage Threshold: ${BOLD}${YELLOW}${REQUIRED_COVERAGE}%${NC}"

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

if [ "$NEEDS_INSTALL" = true ] || [ "$FRESH_INSTALL" = true ]; then
    log_step "Installing dependencies (npm ci)..."
    
    # Remove existing node_modules if --fresh flag is used
    if [ "$FRESH_INSTALL" = true ]; then
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
TEST_FILES=$(find . \
    -type d -name node_modules -prune -false -o \
    \( -name "*.test.js" -o -name "*.test.jsx" -o -name "*.spec.js" -o -name "*.spec.jsx" \) \
| wc -l)
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
if [ "$SKIP_COVERAGE" = true ]; then
    log_header "SKIPPING COVERAGE ANALYSIS"
    log_info "Coverage analysis skipped (--no-coverage flag used)"
    log_header "✅ SUCCESS - ALL TESTS PASSED"
    exit 0
fi

log_header "COVERAGE ANALYSIS"

log_step "Running tests with coverage..."
echo ""

CI=true npm test -- --coverage --watchAll=false --verbose --coverageReporters="text" "text-summary" "lcov" "html" "json-summary" 2>&1 | tee /tmp/coverage-output.log

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
# COVERAGE THRESHOLDS CHECK
# =========================================================
log_header "COVERAGE THRESHOLD VALIDATION"

# Function to extract coverage percentage from JSON
extract_coverage_from_json() {
    local metric=$1
    if [ -f "coverage/coverage-summary.json" ]; then
        # Try multiple methods to extract coverage
        local result=$(node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync('coverage/coverage-summary.json','utf8')); console.log(data.total['$metric'].pct);" 2>/dev/null || echo "")
        
        if [ -z "$result" ]; then
            # Fallback to python if node fails
            result=$(python3 -c "import json; data=json.load(open('coverage/coverage-summary.json')); print(data['total']['$metric']['pct'])" 2>/dev/null || echo "")
        fi
        
        if [ -z "$result" ]; then
            # Final fallback to python2
            result=$(python -c "import json; data=json.load(open('coverage/coverage-summary.json')); print(data['total']['$metric']['pct'])" 2>/dev/null || echo "")
        fi
        
        echo "${result:-0}"
    else
        echo "0"
    fi
}

# Try to get coverage from JSON first (most accurate)
if [ -f "coverage/coverage-summary.json" ]; then
    log_step "Extracting coverage metrics from JSON report..."
    
    STATEMENTS_PCT=$(extract_coverage_from_json "statements")
    BRANCHES_PCT=$(extract_coverage_from_json "branches")
    FUNCTIONS_PCT=$(extract_coverage_from_json "functions")
    LINES_PCT=$(extract_coverage_from_json "lines")
    
    log_info "Statements: ${YELLOW}${STATEMENTS_PCT}%${NC}"
    log_info "Branches:   ${YELLOW}${BRANCHES_PCT}%${NC}"
    log_info "Functions:  ${YELLOW}${FUNCTIONS_PCT}%${NC}"
    log_info "Lines:      ${YELLOW}${LINES_PCT}%${NC}"
    
    # Use lines coverage as the main metric
    COVERAGE_PERCENT=$LINES_PCT
else
    # Fallback to parsing text output
    log_step "Extracting coverage from text output..."
    COVERAGE_PERCENT=$(grep "All files" /tmp/coverage-output.log | awk '{print $10}' | tr -d '%' | head -1 || echo "0")
    
    if [ -z "$COVERAGE_PERCENT" ] || [ "$COVERAGE_PERCENT" = "0" ]; then
        COVERAGE_PERCENT=$(grep "All files" /tmp/coverage-output.log | awk '{print $4}' | tr -d '%' | head -1 || echo "0")
    fi
fi

echo ""
log_step "Validating against required threshold of ${YELLOW}${REQUIRED_COVERAGE}%${NC}..."

# Check if coverage meets threshold
COVERAGE_CHECK_PASSED=false

if [ -n "$COVERAGE_PERCENT" ] && [ "$COVERAGE_PERCENT" != "0" ]; then
    # Use bc for floating point comparison
    if command -v bc >/dev/null 2>&1; then
        if (( $(echo "$COVERAGE_PERCENT >= $REQUIRED_COVERAGE" | bc -l) )); then
            COVERAGE_CHECK_PASSED=true
        fi
    else
        # Fallback to integer comparison if bc is not available
        COVERAGE_INT=${COVERAGE_PERCENT%.*}
        if [ "$COVERAGE_INT" -ge "$REQUIRED_COVERAGE" ]; then
            COVERAGE_CHECK_PASSED=true
        fi
    fi
fi

echo ""

if [ "$COVERAGE_CHECK_PASSED" = true ]; then
    log_success "Coverage requirement MET: ${GREEN}${COVERAGE_PERCENT}%${NC} >= ${YELLOW}${REQUIRED_COVERAGE}%${NC}"
    
    # Additional status messages
    if (( $(echo "$COVERAGE_PERCENT >= 90" | bc -l 2>/dev/null || echo 0) )); then
        log_success "Excellent coverage! 🎉"
        elif (( $(echo "$COVERAGE_PERCENT >= 80" | bc -l 2>/dev/null || echo 0) )); then
        log_success "Good coverage! 👍"
    fi
else
    echo ""
    log_error "Coverage requirement NOT MET!"
    log_error "Current coverage: ${RED}${COVERAGE_PERCENT}%${NC}"
    log_error "Required coverage: ${YELLOW}${REQUIRED_COVERAGE}%${NC}"
    log_error "Shortfall: ${RED}$(echo "$REQUIRED_COVERAGE - $COVERAGE_PERCENT" | bc -l 2>/dev/null || echo "N/A")%${NC}"
    echo ""
    log_info "Please add more tests to increase coverage."
    log_info "View detailed coverage report: ${YELLOW}coverage/lcov-report/index.html${NC}"
    echo ""
    log_header "❌ COVERAGE THRESHOLD NOT MET"
    exit 1
fi

# =========================================================
# DETAILED METRIC VALIDATION (OPTIONAL)
# =========================================================
if [ -f "coverage/coverage-summary.json" ]; then
    echo ""
    log_step "Checking individual metric thresholds..."
    
    METRICS_FAILED=false
    
    check_metric() {
        local metric_name=$1
        local actual=$2
        local required=$3
        
        if (( $(echo "$actual >= $required" | bc -l 2>/dev/null || echo 0) )); then
            log_success "${metric_name}: ${GREEN}${actual}%${NC} >= ${required}%"
        else
            log_warning "${metric_name}: ${YELLOW}${actual}%${NC} < ${required}% (⚠️  Below threshold)"
            METRICS_FAILED=true
        fi
    }
    
    check_metric "Statements" "$STATEMENTS_PCT" "$REQUIRED_STATEMENTS"
    check_metric "Branches  " "$BRANCHES_PCT" "$REQUIRED_BRANCHES"
    check_metric "Functions " "$FUNCTIONS_PCT" "$REQUIRED_FUNCTIONS"
    check_metric "Lines     " "$LINES_PCT" "$REQUIRED_LINES"
    
    if [ "$METRICS_FAILED" = true ]; then
        echo ""
        log_warning "Some individual metrics are below their thresholds (see above)"
        log_info "Consider improving test coverage for better quality assurance"
    fi
fi

# =========================================================
# CLEANUP AND SUMMARY
# =========================================================
log_header "TEST EXECUTION COMPLETE"

log_success "All tests passed with coverage analysis"
log_success "Coverage threshold requirement met: ${GREEN}${COVERAGE_PERCENT}%${NC} >= ${YELLOW}${REQUIRED_COVERAGE}%${NC}"
log_info "Total test files: ${YELLOW}$TEST_FILES${NC}"
log_info "Coverage report: ${YELLOW}$PROJECT_ROOT/coverage/lcov-report/index.html${NC}"
log_info "Logs saved to: ${YELLOW}/tmp/test-output.log, /tmp/coverage-output.log${NC}"

echo ""
log_header "✅ SUCCESS - ALL CHECKS PASSED"

exit 0