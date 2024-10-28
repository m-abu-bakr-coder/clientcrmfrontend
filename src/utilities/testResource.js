const UIText = {
    register: {
        register_text: "Register to Phinch",
        password_validation_text: "Password must be 8-12 characters long, include at least one number, and one special character.",
        already_register: "Already have an account?",
        login_url: "Login here",
    },
    login: {
        login_text: "Login to Pinch",
        not_register: "Not registered?",
        register_url: "Register here",
    },
    navabr: {
        menu_dropdown: {
            profile: "Profile",
            create_client: "Create Client",
            add_csv_file: "Add CSV file",
            admin_setting: "Setting",
            logout: "Logout"
        },
        csv_file_Dialog: {
            cancel: "Cancel",
            title: "Upload CSV file",
            description: "Please select a CSV file from your device to upload. Ensure the file is in the correct format and contains the required data for successful processing.",
            upload_file: "Upload File",
            uploading: "Uploading..."
        }
    },
    create_client: {
        create_client_text: "Add Client",
        description: "Please enter the client's name and email address to add them to the system.",
        add_Client: "Add Client",
        adding: "Adding...",
        cancel: "Cancel"
    },
    table_data: {
        table_header: {
            name: "Name",
            email: "Email",
            date: "Date",
            delete: "Delete"
        },
        confirmation_dialog: {
            title: "Delete Client",
            description: "Are you sure you want to permanently delete this client? This action cannot be undone, and all associated data will be lost.",
            cancel: "Cancel",
            delete: "Delete",
            deleting: "Deleting..."
        },
        not_found: "No clients found for the search term."
    },
    mail_Data: {
        table_header: {
            from: "From",
            to: "To",
            date: "Date",
            action: "Delete"
        },
        table_body: {
            subject: "Subject",
            preview: "Preview",
            attachments: "Attachments"
        },
        confirmation_dialog: {
            title: "Delete Mail",
            description: "Are you sure you want to permanently delete this mail? This action cannot be undone, and all associated data will be lost.",
            cancel: "Cancel",
            delete: "Delete",
            deleting: "Deleting..."
        },
        not_found: "No clients found for the search term."
    },
    all_users: {
        manage_users: "Manage Users",
        table_header: {
            name: "Name",
            email: "Email",
            createdat: "Created At",
            action: "Delete"
        },
        confirmation_dialog: {
            title: "Delete User",
            description: "Are you sure you want to permanently delete this user? This action cannot be undone, and all associated data will be lost.",
            cancel: "Cancel",
            delete: "Delete",
            deleting: "Deleting..."
        },
        not_found: "No user found."
    },
    profile: {
        profile_text: "Profile",
        close: "Close"
    },
    update_admin_credentials: {
        update_admin_password: "Update Admin Password",
        cancel: "Cancel",
        update: "Update",
        updating: "Updating..."
    }
};

export default UIText;