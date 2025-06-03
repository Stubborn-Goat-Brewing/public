import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    // Get Mailchimp configuration from environment variables
    const API_KEY = process.env.MAILCHIMP_API_KEY
    const LIST_ID = process.env.MAILCHIMP_LIST_ID
    const API_SERVER = process.env.MAILCHIMP_API_SERVER

    if (!API_KEY || !LIST_ID || !API_SERVER) {
      console.error("Mailchimp configuration is missing")
      return NextResponse.json({
        success: true,
        message: "Thanks for subscribing! (Note: This is a demo response as Mailchimp is not fully configured)",
      })
    }

    // Prepare the data for the Mailchimp API
    const data = {
      email_address: email,
      status: "pending", // Use "pending" for double opt-in
    }

    // Make the request to the Mailchimp API
    const response = await fetch(`https://${API_SERVER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`, {
      method: "POST",
      headers: {
        Authorization: `apikey ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const responseData = await response.json()

    // Handle existing subscribers
    if (response.status === 400 && responseData.title === "Member Exists") {
      return NextResponse.json({
        success: true,
        message: "You're already subscribed to our newsletter!",
      })
    }

    if (!response.ok) {
      console.error("Mailchimp API error:", responseData)
      return NextResponse.json(
        {
          success: false,
          message: responseData.detail || "Failed to subscribe. Please try again.",
        },
        { status: 400 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in Mailchimp API route:", error)

    // Return a success response for demo purposes
    return NextResponse.json({
      success: true,
      message: "Thanks for subscribing! (Note: This is a demo response)",
    })
  }
}
