<?php

// Settings
$recipient_email = "manuel@kiessling.net"; // <<< Your email address
$subject = "New Consultation Request from Landing Page";
$redirect_page = "index.html"; // Relative path back to the landing page

$response_status = "error"; // Default status

// Check if the form was submitted via POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get and sanitize the submitted email address
    $submitted_email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);

    // Validate the email address
    if (filter_var($submitted_email, FILTER_VALIDATE_EMAIL)) {
        // Prepare email content
        $email_body = "A consultation was requested by: " . $submitted_email;
        $from_address = "manuel@kiessling.net"; // Use your authorized address
        $headers = "From: " . $from_address . "\r\n";
        $headers .= "Reply-To: " . $submitted_email . "\r\n"; // Keep reply-to as the user's email
        $headers .= "X-Mailer: PHP/" . phpversion();

        // Attempt to send the email
        // NOTE: mail() function's success depends heavily on server configuration (sendmail, SMTP setup).
        // This might not work reliably on all hosting environments without further setup.
        if (mail($recipient_email, $subject, $email_body, $headers)) {
            $response_status = "success";
        } else {
            // Email sending failed - potentially log this internally if needed
            $response_status = "error_sending"; // More specific error?
        }
    } else {
        // Invalid email format
        $response_status = "error_invalid";
    }
} else {
    // Not a POST request, script accessed directly or incorrectly
    $response_status = "error_method";
}

// Redirect back to the landing page with the status
header("Location: " . $redirect_page . "?form_status=" . $response_status);
exit; // Ensure script stops execution after redirection

?>

