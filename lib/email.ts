
export async function sendStatusUpdateEmail(
    to: string,
    applicantName: string,
    jobTitle: string,
    status: string
) {
    // In a real application, you would use a service like Resend, SendGrid, or AWS SES here.
    // For now, we will log the email to the console to simulate sending.

    console.log("---------------------------------------------------")
    console.log(`[MOCK EMAIL] Sending Status Update`)
    console.log(`To: ${to}`)
    console.log(`Subject: Update on your application for ${jobTitle}`)
    console.log(`Body:`)
    console.log(`Hi ${applicantName},`)
    console.log(``)
    console.log(`The status of your application for ${jobTitle} has been updated to: ${status}.`)
    console.log(``)
    console.log(`Check your dashboard for more details.`)
    console.log(``)
    console.log(`Best regards,`)
    console.log(`JobPortal Team`)
    console.log("---------------------------------------------------")

    return true
}
