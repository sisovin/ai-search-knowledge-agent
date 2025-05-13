#!/usr/bin/env bash
# Supabase Edge Functions Test Runner
#
# This script runs tests for all Edge Functions and generates a report

echo "🧪 Running Supabase Edge Function Tests..."
echo ""

# Create a test report directory if it doesn't exist
mkdir -p ./test-reports

# Run all tests and collect results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

run_test() {
  local test_file=$1
  local test_name=$(basename "$test_file" .test.ts)
  
  echo "▶️ Testing: $test_name"
  echo "-------------------------------------------"
  
  # Run the test
  deno test --allow-env --allow-net "$test_file" | tee ./test-reports/"$test_name".log
  
  # Get the test status
  local status=${PIPESTATUS[0]}
  local test_count=$(grep -c "test case" ./test-reports/"$test_name".log)
  
  # Update counts
  TOTAL_TESTS=$((TOTAL_TESTS + test_count))
  
  if [ $status -eq 0 ]; then
    echo "✅ $test_name tests passed"
    PASSED_TESTS=$((PASSED_TESTS + test_count))
  else
    echo "❌ $test_name tests failed"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
  
  echo ""
}

# Find and run all test files
for test_file in $(find ./supabase/functions/__tests__ -name "*.test.ts"); do
  run_test "$test_file"
done

# Display summary
echo "===== TEST SUMMARY ====="
echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $((TOTAL_TESTS - PASSED_TESTS))"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
  echo "✅ All tests passed!"
  exit 0
else
  echo "❌ Some tests failed. Check logs for details."
  exit 1
fi
