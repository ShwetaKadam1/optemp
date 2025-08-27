import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { employeeId, amount } = await request.json()

    // Simulate RazorpayX API processing time
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Simulate successful payment
    const transactionId = `rzp_${Date.now()}_${employeeId}`

    // Log the simulated payment
    console.log(`🏦 RazorpayX Payment Simulation:`)
    console.log(`   Employee ID: ${employeeId}`)
    console.log(`   Amount: $${amount}`)
    console.log(`   Transaction ID: ${transactionId}`)
    console.log(`   Status: SUCCESS`)

    return NextResponse.json({
      success: true,
      transactionId,
      amount,
      employeeId,
      status: "paid",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Payment simulation failed:", error)
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 })
  }
}
