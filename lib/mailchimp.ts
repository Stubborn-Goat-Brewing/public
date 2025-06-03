/**
 * Subscribes an email to the Mailchimp audience
 */
export async function subscribeToMailchimp(email: string) {
  try {
    // The API endpoint will be something like:
    // https://<dc>.api.mailchimp.com/3.0/lists/<list_id>/members
    // where <dc> is your data center (e.g., us1, us2) and <list_id> is your audience ID

    const API_KEY = process.env.MAILCHIMP_API_KEY
    const LIST_ID = process.env.MAILCHIMP_LIST_ID
    const API_SERVER = process.env.MAILCHIMP_API_SERVER // e.g., us1

    if (!API_KEY || !LIST_ID || !API_SERVER) {
      console.error("Mailchimp configuration is missing")
      return {
        success: false,
        message: "Newsletter subscription is not configured properly.",
      }
    }

    const response = await fetch(`https://${API_SERVER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`, {
      method: "POST",
      headers: {
        Authorization: `apikey ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status: "pending", // Use "pending" for double opt-in
      }),
    })

    const data = await response.json()

    // Handle existing subscribers
    if (response.status === 400 && data.title === "Member Exists") {
      return {
        success: true,
        message: "You're already subscribed to our newsletter!",
      }
    }

    if (!response.ok) {
      return {
        success: false,
        message: data.detail || "Failed to subscribe. Please try again.",
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error subscribing to Mailchimp:", error)
    return {
      success: false,
      message: "An error occurred. Please try again later.",
    }
  }
}
