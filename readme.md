This project demonstrates how to improve Salesforce data quality by integrating Salesforce with a Node.js + MySQL backend via real-time webhooks.

github repo: https://github.com/KaniC-Web/user-management-api
---------------------------------------------------
When a record is created or updated in Salesforce, it is automatically sent to a User Management API.

The API validates, cleans, and stores the record in a downstream MySQL database (“clean data zone”).

Invalid records are flagged and stored in a separate rejected_data table for auditing.
------------------------------------------------
the following installed on your system:
Node.js (v16+)
MySQL (v8+)
ngrok (for exposing local API to Salesforce)
Salesforce Developer Org (free)
--------------------------------------------------
Installation & Setup:
1. Clone the Repository
2. Install Dependencies
3. Setup MySQL Database
    Create tables:
    Update your MySQL credentials inside db.js:
4. Start Node.js App
5. Expose Localhost with ngrok
6. Salesforce Setup
    Create Custom Object (Customer)
    Add Apex Class
    Add Trigger
------------------------------------------------
Testing
1. Start your Node.js app (node index.js)

2. Start ngrok (ngrok http 3000)

3. Create or update a record in Salesforce (Customer object).

Check:
Logs in VS Code console → should show data received.
MySQL → clean records in users, rejected ones in rejected_data