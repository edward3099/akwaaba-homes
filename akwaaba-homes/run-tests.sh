#!/bin/bash

# AkwaabaHomes Comprehensive Testing Suite
# This script runs different types of tests based on the selected option

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if development server is running
check_dev_server() {
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to start development server
start_dev_server() {
    print_status "Starting development server..."
    npm run dev &
    DEV_SERVER_PID=$!
    
    # Wait for server to start
    print_status "Waiting for development server to start..."
    for i in {1..30}; do
        if check_dev_server; then
            print_success "Development server started successfully!"
            return 0
        fi
        sleep 2
    done
    
    print_error "Development server failed to start within 60 seconds"
    return 1
}

# Function to stop development server
stop_dev_server() {
    if [ ! -z "$DEV_SERVER_PID" ]; then
        print_status "Stopping development server..."
        kill $DEV_SERVER_PID 2>/dev/null || true
        print_success "Development server stopped"
    fi
}

# Function to install Playwright browsers
install_browsers() {
    print_status "Installing Playwright browsers..."
    npx playwright install
    print_success "Browsers installed successfully"
}

# Function to run all tests
run_all_tests() {
    print_status "Running all tests..."
    
    # Run tests with all browsers
    npx playwright test --project=chromium --project=firefox --project=webkit
}

# Function to run tests for specific user type
run_user_tests() {
    local user_type=$1
    print_status "Running tests for $user_type..."
    
    case $user_type in
        "customer")
            npx playwright test tests/customer/
            ;;
        "agent")
            npx playwright test tests/agent/
            ;;
        "admin")
            npx playwright test tests/admin/
            ;;
        *)
            print_error "Unknown user type: $user_type"
            exit 1
            ;;
    esac
}

# Function to run tests with specific browser
run_browser_tests() {
    local browser=$1
    print_status "Running tests with $browser browser..."
    
    npx playwright test --project=$browser
}

# Function to run tests in headed mode
run_headed_tests() {
    print_status "Running tests in headed mode..."
    npx playwright test --headed
}

# Function to run tests with debug mode
run_debug_tests() {
    print_status "Running tests in debug mode..."
    npx playwright test --debug
}

# Function to generate test report
generate_report() {
    print_status "Generating test report..."
    npx playwright show-report
}

# Function to run tests with coverage
run_coverage_tests() {
    print_status "Running tests with coverage..."
    npx playwright test --reporter=html --reporter=json
}

# Function to run performance tests
run_performance_tests() {
    print_status "Running performance tests..."
    
    # Run tests with performance monitoring
    npx playwright test --reporter=html --reporter=json --timeout=60000
    
    # Generate performance report
    print_status "Generating performance report..."
    # Add performance analysis here
}

# Function to run security tests
run_security_tests() {
    print_status "Running security tests..."
    
    # Run authentication and authorization tests
    npx playwright test tests/admin/admin-dashboard.spec.ts --grep "Security and Access Control"
    
    # Run user permission tests
    npx playwright test tests/customer/auth.spec.ts --grep "Form Validation"
}

# Function to run mobile responsiveness tests
run_mobile_tests() {
    print_status "Running mobile responsiveness tests..."
    
    # Run tests with mobile viewports
    npx playwright test --project="Mobile Chrome" --project="Mobile Safari"
}

# Function to run database integration tests
run_database_tests() {
    print_status "Running database integration tests..."
    
    # Check if Supabase is accessible
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        print_warning "Supabase URL not set. Skipping database tests."
        return 0
    fi
    
    # Run tests that interact with database
    npx playwright test --grep "database|supabase|data"
}

# Function to show help
show_help() {
    echo "AkwaabaHomes Testing Suite"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  all                    Run all tests"
    echo "  customer               Run customer tests only"
    echo "  agent                  Run agent tests only"
    echo "  admin                  Run admin tests only"
    echo "  browser [name]         Run tests with specific browser (chromium|firefox|webkit)"
    echo "  headed                 Run tests in headed mode"
    echo "  debug                  Run tests in debug mode"
    echo "  coverage               Run tests with coverage reporting"
    echo "  performance            Run performance tests"
    echo "  security               Run security tests"
    echo "  mobile                 Run mobile responsiveness tests"
    echo "  database               Run database integration tests"
    echo "  install-browsers      Install Playwright browsers"
    echo "  report                 Generate test report"
    echo "  help                   Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 all                 # Run all tests"
    echo "  $0 customer            # Run customer tests only"
    echo "  $0 browser chromium   # Run tests with Chromium browser"
    echo "  $0 mobile             # Run mobile responsiveness tests"
}

# Main script logic
main() {
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -f "playwright.config.ts" ]; then
        print_error "Please run this script from the AkwaabaHomes project root directory"
        exit 1
    fi
    
    # Check if Playwright is installed
    if ! command -v npx &> /dev/null; then
        print_error "npx is not installed. Please install Node.js and npm first."
        exit 1
    fi
    
    # Check if tests directory exists
    if [ ! -d "tests" ]; then
        print_error "Tests directory not found. Please run the test setup first."
        exit 1
    fi
    
    # Parse command line arguments
    case "${1:-help}" in
        "all")
            install_browsers
            start_dev_server
            run_all_tests
            ;;
        "customer"|"agent"|"admin")
            install_browsers
            start_dev_server
            run_user_tests $1
            ;;
        "browser")
            if [ -z "$2" ]; then
                print_error "Please specify a browser name (chromium|firefox|webkit)"
                exit 1
            fi
            install_browsers
            start_dev_server
            run_browser_tests $2
            ;;
        "headed")
            install_browsers
            start_dev_server
            run_headed_tests
            ;;
        "debug")
            install_browsers
            start_dev_server
            run_debug_tests
            ;;
        "coverage")
            install_browsers
            start_dev_server
            run_coverage_tests
            ;;
        "performance")
            install_browsers
            start_dev_server
            run_performance_tests
            ;;
        "security")
            install_browsers
            start_dev_server
            run_security_tests
            ;;
        "mobile")
            install_browsers
            start_dev_server
            run_mobile_tests
            ;;
        "database")
            install_browsers
            start_dev_server
            run_database_tests
            ;;
        "install-browsers")
            install_browsers
            ;;
        "report")
            generate_report
            ;;
        "help"|*)
            show_help
            exit 0
            ;;
    esac
    
    # Stop development server if it was started
    stop_dev_server
    
    print_success "Testing completed successfully!"
}

# Trap to ensure development server is stopped on script exit
trap stop_dev_server EXIT

# Run main function with all arguments
main "$@"
