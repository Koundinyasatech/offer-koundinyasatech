KTS Employee Management System
A full-stack web application for managing employee records, offer letter uploads, and secure role-based access — built for Koundinyasa Technology Services.

Table of Contents

            -->Overview
            -->Features
            -->Tech Stack
            -->Architecture
            -->Data Flow
            -->Project Structure
            -->Getting Started
            -->Environment Variables
            -->API Reference
            -->Deployment


Overview
The KTS Employee Management System provides a secure, responsive portal for HR admins and employees. Admins can add, edit, and manage employee records and upload offer letters (PDFs). Employees can log in and download their own documents. The system uses role-based authentication — admins and employees share the same login page but are routed to separate dashboards based on their role.

Features
    Admin
      Secure login with role-based routing
      Add new employees with designation, contact details, date of joining (DOJ), date of entry (DOE), and status
      Auto-generate unique employee codes
      Upload offer letter PDFs per employee
      Edit existing employee records
      View all employees in a paginated, searchable table
      View employee PDFs inline in the browser

    Employee

      Secure login using Employee ID and code
      View and download personal offer letter documents
      Inactive employees are blocked at login with a clear message