#!/bin/bash
# Railway Smoke Tests
# Tests deployed totalaud.io instance

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

RAILWAY_URL="${RAILWAY_URL:-}"

if [ -z "$RAILWAY_URL" ]; then
  echo -e "${RED}❌ RAILWAY_URL environment variable not set${NC}"
  echo "Usage: RAILWAY_URL=https://your-app.railway.app ./scripts/railway-smoke-tests.sh"
  exit 1
fi

echo "🧪 Running Smoke Tests for: $RAILWAY_URL"
echo "=========================================="
echo ""

FAILED=0
PASSED=0

test_endpoint() {
  local name=$1
  local path=$2
  local expected_status=${3:-200}
  
  echo -n "Testing $name... "
  
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$RAILWAY_URL$path" || echo "000")
  
  if [ "$HTTP_CODE" = "$expected_status" ]; then
    echo -e "${GREEN}✓${NC} (HTTP $HTTP_CODE)"
    ((PASSED++))
    return 0
  else
    echo -e "${RED}✗${NC} (HTTP $HTTP_CODE, expected $expected_status)"
    ((FAILED++))
    return 1
  fi
}

# Health Check
test_endpoint "Health Check" "/api/health" 200

# OS Surfaces
test_endpoint "ASCII OS" "/os/ascii" 200
test_endpoint "XP OS" "/os/xp" 200
test_endpoint "Aqua OS" "/os/aqua" 200
test_endpoint "DAW OS" "/os/daw" 200
test_endpoint "Analogue OS" "/os/analogue" 200
test_endpoint "LoopOS" "/os/loopos" 200
test_endpoint "Studio OS" "/os/studio" 200

# Demo
test_endpoint "Demo Mode" "/demo" 200

# Console
test_endpoint "Console" "/console" 200

echo ""
echo "=========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
  echo -e "${RED}Failed: $FAILED${NC}"
  exit 1
else
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
fi

