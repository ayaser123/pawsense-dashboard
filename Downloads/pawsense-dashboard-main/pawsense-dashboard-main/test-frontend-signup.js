// Test signup flow exactly as frontend does it
const testSignup = async () => {
  const timestamp = new Date().getTime()
  const email = `frontend_test_${timestamp}@example.com`
  const password = "TestPass123"
  const fullName = "Frontend Test User"
  
  console.log("🔄 Starting frontend signup test...")
  console.log("Email:", email)
  
  try {
    const backendUrl = "http://localhost:5000"
    
    // Step 1: Check health
    console.log("\n1️⃣ Checking backend health...")
    const healthRes = await fetch(`${backendUrl}/health`)
    if (!healthRes.ok) {
      throw new Error("Backend health check failed")
    }
    console.log("✅ Backend is running")
    
    // Step 2: Call /auth/create-user
    console.log("\n2️⃣ Calling /auth/create-user...")
    const createUserRes = await fetch(`${backendUrl}/auth/create-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        metadata: { full_name: fullName }
      })
    })
    
    console.log("Response status:", createUserRes.status, createUserRes.statusText)
    
    let responseText = await createUserRes.clone().text()
    console.log("Response text:", responseText)
    
    const data = JSON.parse(responseText)
    console.log("Parsed response:", data)
    
    if (!createUserRes.ok) {
      const errorMsg = data.details || data.message || data.error || "Unknown error"
      console.error("❌ Backend error:", errorMsg)
      throw new Error(`Backend error: ${errorMsg}`)
    }
    
    console.log("✅ Backend user created:", data.userId)
    
    // Step 3: Try to login with Supabase
    console.log("\n3️⃣ Attempting Supabase login...")
    
    // For testing, we'll just show what would happen
    console.log("In production, would now login with email:", email)
    console.log("✅ Signup test completed successfully!")
    
  } catch (err) {
    console.error("❌ Test failed:", err.message)
  }
}

// Run the test
testSignup()
