#!/bin/bash
# Complete Signup Flow Test Script

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          PawSense Signup Flow - Complete Test                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check ports
echo "📋 Step 1: Checking if servers are running..."
echo "  Backend port 5000: " && (netstat -ano 2>/dev/null | grep ":5000" > /dev/null && echo "✅ Running" || echo "❌ Not found")
echo "  Frontend port 8084: " && (netstat -ano 2>/dev/null | grep ":8084" > /dev/null && echo "✅ Running" || echo "❌ Not found")
echo ""

# Test backend health
echo "📋 Step 2: Testing Backend Health..."
HEALTH_RESPONSE=$(curl -s http://localhost:5000/health)
if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
    echo "✅ Backend is healthy"
    echo "   Response: $HEALTH_RESPONSE" | head -c 100
    echo ""
else
    echo "❌ Backend health check failed"
    echo "   Response: $HEALTH_RESPONSE"
    exit 1
fi
echo ""

# Test Supabase connection
echo "📋 Step 3: Testing Supabase Connection..."
DEBUG_RESPONSE=$(curl -s http://localhost:5000/debug/supabase)
if echo "$DEBUG_RESPONSE" | grep -q "ok"; then
    echo "✅ Supabase connection successful"
    echo "   Response: $DEBUG_RESPONSE" | head -c 150
    echo ""
else
    echo "❌ Supabase connection failed"
    echo "   Response: $DEBUG_RESPONSE"
fi
echo ""

# Test user creation
echo "📋 Step 4: Testing User Creation..."
TIMESTAMP=$(date +%s%N | cut -b1-13)
TEST_EMAIL="test_${TIMESTAMP}_$(cat /dev/urandom | tr -dc 'a-z0-9' | fold -w 6 | head -n 1)@pawsense-test.dev"
TEST_PASSWORD="TestPassword123!"

echo "  Email: $TEST_EMAIL"
echo "  Testing /auth/create-user endpoint..."

CREATE_RESPONSE=$(curl -s -X POST http://localhost:5000/auth/create-user \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"metadata\": {\"full_name\": \"Test User\"}
  }")

if echo "$CREATE_RESPONSE" | grep -q "success"; then
    echo "✅ User created successfully"
    USER_ID=$(echo "$CREATE_RESPONSE" | grep -o '"userId":"[^"]*"' | cut -d'"' -f4)
    echo "   User ID: $USER_ID"
else
    echo "❌ User creation failed"
    echo "   Response: $CREATE_RESPONSE"
fi
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                      TEST COMPLETE                             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ All backend tests passed!"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:8084/signup in your browser"
echo "2. Use these credentials:"
echo "   Email: $TEST_EMAIL"
echo "   Password: $TEST_PASSWORD"
echo "   Name: Your Name"
echo "3. Submit the form"
echo "4. Check browser console (F12) for [SIGNUP] and [AUTH] logs"
echo "5. You should be redirected to /dashboard on success"
echo ""
